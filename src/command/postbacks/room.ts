import { postback } from "../typings";
import { convert, hasThaiNumerals } from '../../utils/dateThai';
import { formatTime, isDateMinToday, mergeDateAndTime } from "../../utils/date";
import { flex } from "../../utils/flex";
import { usePostbackSession } from "../main";
import moment from "moment";

export const main: postback = {
    name: "room",
    execute: (event, client, app) => {
        const data = JSON.parse(event.postback.data);
        const params = event.postback.params;

        const date = hasThaiNumerals(params.date) ? convert(params.date) : params.date;
        if (!isDateMinToday(date)) return;

        const room = app.getRoom(data.room);
        if (!room) return;

        const message = new flex();
        message.setTitle("เวลาทั้งหมด")

        room.times.map((time) => {
            const hasBooking = app.isRoomBooking(room.id, time.id, date);
            const textDate = (new Date(date)).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })

            const momentEnd = moment(`${date} ${time.end}`);
            const momentCur = moment();
            const overtime     = !momentEnd.isAfter(momentCur);

            if (!hasBooking && !overtime){
                message.add({
                    title: `${formatTime(time.start)} - ${formatTime(time.end)}`,
                    metadata: [
                        {label: "ห้อง", value: room.label, style: "list"},
                        {label: "วันที่", value: textDate, style: "list"},
                        {label: "สถานะ", value: "ว่าง", style: "list"},
                        {label: "จอง", style: "button", action: {
                            type: "postback",
                            data: JSON.stringify({
                                "use": "booking_dialogs",
                                "session": usePostbackSession(-1, 1, 5000),
                                "data": {
                                    room: data.room,
                                    time: time.id,
                                    date: date
                                }
                            }),
                        }},
                    ]
                })
            }else{
                if (hasBooking){
                    const bookingBy = app.getMember(hasBooking.booking);
                    message.add({
                        title: `${formatTime(time.start)} - ${formatTime(time.end)}`,
                        metadata: [
                            {label: "ห้อง", value: room.label, style: "list"},
                            {label: "วันที่", value: textDate, style: "list"},
                            {label: "สถานะ", value: `ถูกจองโดย : ${bookingBy?.label}`, style: "list"},
                        ]
                    })
                }else{
                    message.add({
                        title: `${formatTime(time.start)} - ${formatTime(time.end)}`,
                        metadata: [
                            {label: "ห้อง", value: room.label, style: "list"},
                            {label: "วันที่", value: textDate, style: "list"},
                            {label: "สถานะ", value: `เกินเวลา`, style: "list"},
                        ]
                    })
                }
            } 
        })

        client.replyMessage(event.replyToken, message.render())
    }
}