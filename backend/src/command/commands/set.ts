import { WebhookEvent } from '@line/bot-sdk';
import {command} from '../typings';
import conn from '../../models/connection';
import member from '../../models/member';

export const main : command = {
    command : "set",
    debouce: 60*1000,
    args: [
        {name:"attribute", type:"string", required: true},
        {name:"value", type:"string", required:true} 
    ],
    execute: async (event : WebhookEvent | any, client, appData, args : any) => {
        const attribute : string = args.attribute;
        const value : string = args.value;

        const errorMessage = () => {
            client.replyMessage(event.replyToken,{
                type: "text", 
                text: "เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!"
            })
        }


        switch (attribute) {
            case "name":
                conn.execute("UPDATE members SET label = ? WHERE userid = ? AND app = ?", [value, event.source.userId, appData.id]).then(([rows] : any) => {
                    if (rows.changedRows > 0) return client.replyMessage(event.replyToken,{
                        type: "text", 
                        text: "คุณได้เปลี่ยนแปลงชื่อเรียบร้อยแล้ว!"
                    }).catch(() => errorMessage())
                })

                break;
            case "notification":

                member.Notification(value, `คุณได้เชื่อมต่อระบบกับจองห้องแล้ว`).then(({data} : any) =>{
                    conn.execute("UPDATE members SET notification = ? WHERE userid = ? AND app = ?", [value, event.source.userId, appData.id]).then(([rows] : any) => {
                        client.replyMessage(event.replyToken,{
                            type: "text", 
                            text: "คุณได้เชื่อมต่อระบบการแจ้งเตือนเรียบร้อยแล้ว!"
                        })
                    }).catch(() => errorMessage())
                }).catch(({response}) =>{
                    return client.replyMessage(event.replyToken,{
                        type: "text", 
                        text: "ไม่สามารถทำรายการได้ : " + response.data.message
                    })
                })

                break;
            default:
                break;
        }
    }
} 
