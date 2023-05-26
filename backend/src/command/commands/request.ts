import conn from '../../models/connection';
import { command } from '../typings';
import member from '../../models/member';

export const main: command = {
    command: ['request', 'req'],
    args: [
        {name: "name", type:"string"}
    ],
    debouce: 5000,
    execute: async (event, client, appData, args: any) => {
        const displayName = await member.GetDisplayName(client, event.source.userid, args.name || "ไม่มีชื่อ");
        const userId = event.source.userId

        if (!displayName) return;
        if (!userId) return;

        conn.execute("SELECT status FROM members WHERE userid = ? AND app = ?", [userId, appData.id]).then(([rows] : any) => {
            if (rows.length <= 0){
                conn.execute(`INSERT INTO members (userid, app, label, status) VALUES (?, ?, ?, 0)`, [userId, appData.id, displayName]).then((result) => {
                    client.getBotInfo().then((bot) => {
                        client.replyMessage(event.replyToken, {
                            type:"text",
                            text: `คุณได้ขอเข้าใช้งานระบบจองห้อง ${bot.displayName} ด้วยชื่อ ${displayName} แล้ว!`
                        }) 
                    })
                })
            }else{
                client.replyMessage(event.replyToken, {
                    type:"text",
                    text: `คุณได้ขอเข้าใช้ระบบของห้องแล้ว`
                }) 
            }
        }) 
    }
} 
