import { getYMDdate } from '../utils/date';
import conn from './connection';

export interface time{
    id : number,
    room : number,
    start : string,
    end : string,
    users: {
        userid: string,
        label: string
    }
}

export default {
    getTimes:  (room : number, date : String)  => {
       
        return new Promise(async (resolve, reject)  => {
            conn.execute(`
                    SELECT 
                        times.id,
                        times.room,
                        times.start,
                        times.end,
                        members.userid,
                        members.label
                    FROM 
                        times 
                    LEFT JOIN bookings ON
                        times.id = bookings.time AND
                        times.room = bookings.room AND
                        bookings.date = ? AND
                        bookings.status = 0 
                    LEFT JOIN members ON 
                        members.userid = bookings.booking 
                    WHERE 
                        times.room = ? AND 
                        times.deleted = 0`
            , [date, room]).then(([rows] : any) => {
                const times : time[] = [];
                

                rows.map((data : any) => {
                    times.push({
                        id : data.id,
                        room : data.room,
                        start :  data.start,
                        end : data.end,
                        users: {
                            userid: data.userid,
                            label: data.label
                        }
                    })
                })

                resolve(times)
            }).catch(reject);
        })
    }
}