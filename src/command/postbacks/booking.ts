import { WebhookEvent } from "@line/bot-sdk";
import { convert, hasThaiNumerals } from "../../utils/dateThai";
import { flex } from "../../utils/flex";
import { App } from "../../models/app";

module.exports = {
    name: "booking",
    execute: (event : WebhookEvent | any, app : App) => {
        const data = JSON.parse(event.postback.data);
        const params = event.postback.params;
        const room = app.getRoom(data.room);
        const member = app.getMember(event.source.userId);
        const client = app.client

        if (!room) return;
        if (!member) return;

        const message = new flex();
        const metascale : [number, number] = [1,2];

        if (data.type == "init"){
            const start = hasThaiNumerals(params.time) ? convert(params.time) : params.time;
            message.setTitle(room?.label);
            message.setTitleAlign('center');
     
            message.add({
                title: "รายละเอียด",
                metadata: [
                    { label: "วันที่", scale: metascale, value: (new Date(data.date)).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }), style: "list" },
                    { label: "เวลา (เริ่ม)", scale: metascale, value: `${start}`, style: "list" },
                    {
                        label: "เวลา (สิ้นสุด)", 
                        style: "button", 
                        action: {
                            label: "เวลาสิ้นสุด", 
                            type: "datetimepicker",
                            mode: "time",
                            data: JSON.stringify({
                                use: "booking", 
                                type: "confirmation",
                                start: start,
                                room: data.room,
                                date: data.date,
                            })
                        } 
                    }
                ]
            })
            client.replyMessage(event.replyToken, message.render());
        }else if(data.type == "confirmation"){
            const start = data.start;
            const finish = hasThaiNumerals(params.time) ? convert(params.time) : params.time;

            message.setTitle(room?.label);
            message.setTitleAlign('center');
     
            message.add({
                title: "รายละเอียด",
                metadata: [
                    { label: "วันที่", scale: metascale, value: (new Date(data.date)).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }), style: "list" },
                    { label: "เวลา (เริ่ม)", scale: metascale, value: `${start}`, style: "list" },
                    { label: "เวลา (สิ้นสุด)", scale: metascale, value: `${finish}`, style: "list" },
                    {
                        label: "ยืนยันการจองห้อง",
                        style: "button",
                        action: {
                            type: "postback",
                            data: JSON.stringify({
                                use: "booking",
                                type: "booking",
                                start: start,
                                finish: finish,
                                room: data.room,
                                date: data.date,
                            })
                        }
                    }
                    
                ]
            })

            

            client.replyMessage(event.replyToken, message.render());
        }else if (data.type == "booking"){
            const start = data.start;
            const finish = data.finish;
            const date = data.date;

            app.booking(data.room, start, finish, date, event.source.userId);
        }

    }
}