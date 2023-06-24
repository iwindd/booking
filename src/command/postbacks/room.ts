import { postback } from "../typings";
import { convert, hasThaiNumerals } from '../../utils/dateThai';
import { formatTime, isDateMinToday, mergeDateAndTime } from "../../utils/date";
import { flex } from "../../utils/flex";
import moment from "moment";
import { WebhookEvent } from "@line/bot-sdk";
import { App } from "../../models/app";

module.exports = {
    name: "room",
    execute: (event : WebhookEvent | any, app : App) => {
        const data = JSON.parse(event.postback.data);
        const params = event.postback.params;
        const client = app.client;

        const date = hasThaiNumerals(params.date) ? convert(params.date) : params.date;
        if (!isDateMinToday(date)) return;

        const room = app.getRoom(data.room);
        if (!room) return;

        const message = new flex();
        message.setTitle("ตารางการจองห้อง");
        message.setTitleAlign("center");

        app.getBookings().map((booking) => {
            const bookingDate = moment(booking.date).format('YYYY-MM-DD');
            const initDate   =  moment(date).format('YYYY-MM-DD')
            if (bookingDate != initDate) return;

            const member = app.getMember(booking.booking);
            if (!member) return;

            message.add({
                title: `${formatTime(booking.time.start)} - ${formatTime(booking.time.end)}`,
                metadata: [
                    {label: "ผู้จอง", value: member.label, style: "list"},
                ]
            })
        })

        message.add({
            title: "การจองห้อง",
            align: "center",
            metadata: [
                {
                    label: "จองห้อง", 
                    style: "button", 
                    action: {
                        label: "เวลาเริ่มต้น", 
                        type: "datetimepicker",
                        mode: "time",
                        data: JSON.stringify({
                            use: "booking",
                            type: "init", 
                            room: data.room,
                            date: date,
                        })
                    }
                },
            ]
        })

        client.replyMessage(event.replyToken, message.render())
    }
}