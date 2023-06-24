import { WebhookEvent } from "@line/bot-sdk";
import { postback } from "../typings";
import { App } from "../../models/app";


module.exports = {
    name: "request",
    execute: async (event : WebhookEvent | any, app : App) => {
        const data = JSON.parse(event.postback.data).data;
        const MemberData = app.getMember(data.userId);
        const client = app.client;

        switch (data.type) {
            case "1":
                if (app.isMemberAllowed(data.userId)) return
                app.setMemberAttribute(data.userId, "allowed", 1, true);

                /* ADMIN NOTIFICATION */    
                client.replyMessage(event.replyToken, {
                    type: "text",
                    text: `คุณได้อนุญาต ${MemberData?.label || "ไม่ทราบชื่อ"} เข้าใช้งานระบบแล้ว!`
                })

                /* MEMBER NOTIFICATION */
                client.pushMessage(data.userId, {
                    type: "text",
                    text: "คุณได้รับอนุญาตเข้าใช้งานระบบจองห้องแล้ว!"
                });

                break;
            case "0":
                if (!app.hasMember(data.userId)) return 
                if (app.isMemberAllowed(data.userId)) return

                /* DELETE */
                app.removeMember(data.userId); 

                /* ADMIN NOTIFICATION */    
                client.replyMessage(event.replyToken, {
                    type: "text",
                    text: `คุณได้ลบคำขอใช้งานของ ${MemberData?.label || "ไม่ทราบชื่อ"} แล้ว!`
                })

                /* MEMBER NOTIFICATION */
                client.pushMessage(data.userId, {
                    type: "text",
                    text: "คุณถูกปฏิเสธจากการขอเข้าใช้งานระบบ"
                });

                break;
            default:
                break;
        }
    }
}