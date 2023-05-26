import { postback } from "../typings";
import conn from "../../models/connection";
import { Message } from "@line/bot-sdk";
import member from "../../models/member";

export const main : postback = {
    name: "booking",
    execute: async (event, client, appData) => {
        const data = JSON.parse(event.postback.data);
        const params = data.data;

        const reply = (message : Message) =>{
            client.replyMessage(event.replyToken, message)
        }

        const errorMsg = () => reply({type: "text", text:"ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้งภายหลัง!"});

        const [using] : any = await conn.execute(`
            SELECT 
                bookings.id,
                bookings.booking,
                times.id as timeId,
                rooms.label
            FROM 
                bookings 
            LEFT JOIN times ON 
                times.id = ? AND
                times.room = ? AND
                times.deleted = 0
            LEFT JOIN rooms ON
                rooms.id = bookings.room AND
                rooms.deleted = 0
            WHERE 
                bookings.room = ? AND 
                bookings.time = ? AND 
                bookings.date = ?
        `, [
            params.time,
            params.room,
            params.room,
            params.time,
            params.date
        ])

        if (using.length > 0) {
            if (!using[0]?.id) return errorMsg();
            if (!using[0]?.timeId) return errorMsg();
            if (!using[0]?.label) return errorMsg();
            if (!using[0]?.booking) return errorMsg();

            member.getUser(using[0].booking, client).then(async (user : any) => {
                const displayName = await user.getName();

                reply({type : "text", text: `ไม่สามารถจองห้องได้ ห้อง ${using[0].label} ถูกจองโดย ${displayName} อยู่แล้ว!`})
            }).catch(() => {
                return errorMsg();
            })

            return;
        }
        
        
        conn.execute("INSERT INTO bookings (room, date, time, booking) VALUES (?, ?, ?, ?)", [params.room, params.date, params.time, event.source.userId]).then((resp) => {
           /*  reply({ type: "text", text: "จองห้องสำเร็จ!" }); */
            const msg : string = `คุณได้จองห้อง ${params.label} เวลา ${params.start} - ${params.end} เป็นที่เรียบร้อยแล้ว!`;

            member.getUser(event.source.userId, client).then(async (user : any) => {
                user.FullNotification(msg)
            }).catch(() => {
               return reply({type : "text", text: msg})
            })
    /*         return reply({type : "text", text: msg})
            
            */
        }).catch((err) => {
            reply({ type: "text", text: "ไม่สามารถจองได้ กรุณาลองใหม่อีกครั้งภายหลัง!" });
        }) 
    }
}