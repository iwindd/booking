import conn from '../../models/connection';
import { command } from '../typings';
import member from '../../models/member';
import { App } from '../../models/app';
import { RequestFlexMessage } from '../flex/request';

export const main: command = {
    command: ['ขอเข้าใช้งาน', 'สมัคร'],
    args: [
        {name: "firstname", type:"string", required: true},
        {name: "lastname", type:"string", required: true},
        {name: "data", type:"string", required: true}
    ],
    allowed: false,
    debouce: 5000,
    execute: async (event, client, app : App, args: any) => {
        const displayName = await member.GetDisplayName(client, event.source.userid, (`${args.firstname} ${args.lastname}`) || "ไม่มีชื่อ");
        const userId = event.source.userId

        if (!displayName) return;
        if (!userId) return;

        if (!app.hasMember(userId)){
            app.addMember({
                userid : userId,
                label: displayName,
                data: args.data,
                allowed: 0,
                isAdmin : 0
            }).then(() => {
                client.replyMessage(event.replyToken, {
                    type:"text",
                    text: `คุณได้ขอเข้าใช้งานระบบจองห้องด้วยชื่อ ${displayName} (รายละเอียด: ${args.data}) แล้ว!`
                })

                app.send("admin", [
                    {
                        type: "text", 
                        text: `${displayName} ได้ขอเข้าใช้งานระบบ`
                    },{
                        type: "flex",
                        altText: `${displayName} ได้ขอเข้าใช้งานระบบ`,
                        contents: RequestFlexMessage(displayName, args.data, {
                            userId: userId
                        })
                    }
                ])
            })
        }else{
            client.replyMessage(event.replyToken, {
                type:"text",
                text: `คุณได้ขอเข้าใช้ระบบของห้องแล้ว`
            }) 
        }
    }
} 
