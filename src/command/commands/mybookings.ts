import { command } from '../typings';
import { formatTime } from '../../utils/date';
import { flex } from '../../utils/flex';
import moment from 'moment';

export const main: command = {
    command: "การจองของฉัน",
    args: [],
    allowed: true,
    execute: async (event, client, app) => {
        const bookings = app.getBookings();
        const filter  = bookings.filter(booking => booking.booking == event.source.userId);

        const message = new flex();
        message.setTitle("การของของฉัน");

        filter.map((booking) => {
            const room = app.getRoom(booking.room);
            if (!room) return;
            const time = room.times.find(time => time.id == booking.time);
            if (!time) return;

            const momentEnd = moment(`${booking.date} ${time.end}`);
            const momentCur = moment();
            const isEnd     = !momentEnd.isAfter(momentCur);

            if (!isEnd){
                message.add({
                    title: room.label,
                    metadata: [
                        {label: "วันที่", value: (new Date(booking.date)).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }), style:"list"},
                        {label: "เวลา", value: `${formatTime(time.start)} - ${formatTime(time.end)}`, style:"list"}
                    ]
                })
            }
        })

        if (message.isEmpty()){
            message.add({
                title: "ไม่มีการจอง",
                align: "center",
                metadata: []
            })
        }

        client.replyMessage(event.replyToken, message.render());
    }
} 
