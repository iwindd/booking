import { formatTime, mergeDateAndTime } from '../utils/date';
import conn from './connection';
import appLib from '../models/app';

export interface booking{
    id: number,
    label: string,
    date : Date,
    start : string,
    end : string
}

export default {
    getBookings:  (app : number, user: string)  => {
        return new Promise(async (resolve, reject)   => {
            conn.execute(`
                SELECT 
                    bookings.id,
                    bookings.date,
                    times.start,
                    times.end,
                    rooms.label
                FROM 
                    bookings
                LEFT JOIN rooms ON 
                    bookings.room = rooms.id
                LEFT JOIN times ON 
                    bookings.time   = times.id AND 
                    bookings.room   = times.room
                WHERE 
                    bookings.booking = ? AND
                    bookings.status  = 0
            `, [user]).then(([rows] : any) => {
                resolve(rows);
            }).catch(reject);
        })
    },

    cron: () =>{
        const currentDate = new Date().toISOString().split('T')[0];

        console.log(currentDate);
        conn.execute(`
            SELECT 
                bookings.id,
                bookings.date,
                bookings.booking,
                times.start,
                times.end,
                rooms.label,
                rooms.app
            FROM
                bookings
            LEFT JOIN rooms ON 
                bookings.room = rooms.id
            LEFT JOIN times ON 
                bookings.time   = times.id AND 
                bookings.room   = times.room
            WHERE 
                bookings.status  = 0 AND
                bookings.date <= ?
        `, [currentDate]).then(([bookings] : any) => {
            const nowDate = new Date();
            const success : number[] = [];

            bookings.map((booking : {
                id : number, 
                date: Date, 
                end: string
            }) => {
                const bookDate = mergeDateAndTime(booking.date, booking.end);

                if (nowDate>=bookDate) success.push(booking.id)
            })

            if (success.length <= 0) return;

            const placeholders = success.map(() => '?').join(',');
            const query = `UPDATE bookings SET status = 1 WHERE id IN (${placeholders})`;
            conn.execute(query, success).then((result) => {
                const data = bookings.filter((booking : any) => success.includes(booking.id));

                data.map((booking : any) => {
                    const app = appLib.getAppById(booking.app);

                    if (!app) return;
                    if (!app.client) return;

                    app.client.pushMessage(booking.booking, [
                        {
                            "type":"text",
                            "text":`#${booking.id} การจองห้อง ${booking.label} \nเวลา ${formatTime(booking.start)} ถึง ${formatTime(booking.end)}\nของคุณได้สิ้นสุดลงแล้ว!`
                        }
                    ])
                })
            });
        })
    }
}