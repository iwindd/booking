import { postback } from "../typings";
import conn from "../../models/connection";
import { Message } from "@line/bot-sdk";

export const main : postback = {
    name: "booking",
    execute: (event, client, appData) => {
        const data = JSON.parse(event.postback.data);
        const params = data.data;

        const reply = (message : Message) =>{
            client.replyMessage(event.replyToken, message)
        }

        conn.execute("INSERT INTO bookings (room, date, time, booking) VALUES (?, ?, ?, ?)", [params.room, params.date, params.time, event.source.userId]).then((resp) => {
            reply({
                type: "text",
                text: "จองห้องสำเร็จ!"
            })
        }).catch((err) => {
            reply({
                type: "text",
                text: "ไม่สามารถจองได้ กรุณาลองใหม่อีกครั้งภายหลัง!"
            })
        })
    }
}