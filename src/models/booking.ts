import { formatTime, mergeDateAndTime } from '../utils/date';
import conn from './connection';
import AppModel from '../models/app';
import member from './member';
import moment from 'moment';


export interface booking {
    id: number,
    label: string,
    date: Date,
    start: string,
    end: string
}

export default {
    cron: () => {
        const momentCur = moment();

        conn.execute(`
            SELECT 
                bookings.id,
                bookings.date,
                bookings.booking,
                times.start,
                times.end,
                rooms.label,
                rooms.app,
                members.notification
            FROM
                bookings
            LEFT JOIN rooms ON 
                bookings.room = rooms.id
            LEFT JOIN times ON 
                bookings.time   = times.id AND 
                bookings.room   = times.room
            LEFT JOIN members ON 
                bookings.booking = members.userid
            WHERE 
                bookings.status  = 0 AND
                bookings.date <= ?
        `, [momentCur.format("YYYY-MM-DD")]).then(([bookings]: any) => {
            const success : number[] = [];
            const apps = AppModel.gets();

            bookings.map((booking : {
                id : number, 
                date: Date, 
                end: string,
                app : number
            }) => {
                const momentEnd = moment(booking.date);
                const timeString = booking.end;
                const [hours, minutes, seconds] : any[] = timeString.split(':');

                momentEnd.set({ hours, minutes, seconds });
                
                const isEnd     = !momentEnd.isAfter(momentCur);
                const app       = apps.find(app => app.id == booking.app);

                if (app) app.setBooking(booking.id, "status", 1);
                if (isEnd) success.push(booking.id);
            })

            if (success.length <= 0) return;
            const placeholders = success.map(() => '?').join(',');
            conn.execute(`UPDATE bookings SET status = 1 WHERE id IN (${placeholders})`, success).then(async (result) => {
                const data = bookings.filter((booking : any) => success.includes(booking.id));
                
                data.map(async (booking : any) => {
                    let app       = apps.find(app => app.id == booking.app);
                    if (!app) app = await AppModel.getAppById(booking.app);

                    if (!app) return;
                    if (!app.ready()) return;
                    const msg : string = `การจองห้อง ${booking.label} \nเวลา ${formatTime(booking.start)} ถึง ${formatTime(booking.end)}\nของคุณได้สิ้นสุดลงแล้ว!`

                    member.FullNotification(booking.notification, booking.booking, msg, app.client)
                })  
            });
        })
    }
}