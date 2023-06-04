import conn from '../../models/connection';
import { command } from '../typings';
import member from '../../models/member';
import { App } from '../../models/app';
import { RequestFlexMessage } from '../flex/request';
import { Message } from '@line/bot-sdk';
import { flex } from '../../utils/flex';
import { usePostbackSession } from '../main';

export const main: command = {
    command: 'ผู้ขอเข้าใช้งานระบบ',
    args: [],
    allowed: true,
    onlyAdmin: true,
    debouce: 5000,
    execute: async (event, client, app : App, args: any) => {
        const members = app.getMembers();
        const requests = members.filter(member => member.allowed == 0);

        if (requests.length > 0){
            const message  = new flex();
            message.setTitle("ผู้ขอเข้าใช้งานระบบทั้งหมด");

            requests.map((request) => {
                message.add({
                    title: request.label,
                    metadata: [
                        {style: "list", scale: [1, 1], label: "รายละเอียด", value: request.data},
                        {style: "confirmation",
                            confirmLabel : "ยอมรับ",
                            cancelLabel : "ลบ",
                            confirm: {
                                "type": "postback",
                                "data": JSON.stringify({
                                    "use": "request",
                                    "session": usePostbackSession(-1, 1, 5000),
                                    "data": {
                                        type: "1",
                                        userId: request.userid
                                    }
                                }),
                            },
                            cancel: {
                                "type": "postback",
                                "data": JSON.stringify({
                                    "use": "request",
                                    "session": usePostbackSession(-1, 1, 5000),
                                    "data": {
                                        type: "0",
                                        userId: request.userid
                                    }
                                }),
                            }
                        }
                    ]
                })
            })

            client.replyMessage(event.replyToken, message.render())
        }else{
            client.replyMessage(event.replyToken, {
                type: "text",
                text: "ไม่มีผู้ขอเข้าใช้งาน"
            })
        }
    }
} 
