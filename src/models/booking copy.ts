import AppModel from '../models/app';
import moment from 'moment'
import conn from './connection';
import { formatTime } from '../utils/date';

export default {
    cron: () =>{
        const apps = AppModel.gets();
        const updated : number[] = [];

        apps.map((app) => {
            const bookings = app.getBookings().filter(booking => booking.status == 0);

            bookings.map((booking) => {
                const room = app.getRoom(booking.id);
                const time = room?.times.find(time => time.id == booking.time);

                if (!room) return
                if (!time) return

                const momentEnd = moment(`${booking.date} ${time.end}`);
                const momentCur = moment();
                const isEnd     = !momentEnd.isAfter(momentCur);

                if (isEnd){
                    app.setBooking(booking.id, "status", 1);
                    updated.push(booking.id);

                    app.client?.pushMessage(booking.booking, {
                        type: "text",
                        text: `การจองห้อง ${room.label} เวลา ${formatTime(time.start)}-${formatTime(time.end)} ได้สิ้นสุดลงแล้ว!`
                    }, true)
                }
            })
        })
        
        if (updated.length <= 0) return;

        const placeholders = updated.map(() => '?').join(',');
        conn.execute(`UPDATE bookings SET status = 1 WHERE id IN (${placeholders})`, updated);
    }
}
