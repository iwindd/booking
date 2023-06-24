import { QuickReply, QuickReplyItem } from '@line/bot-sdk';
import usePostback from '../command/postback';
import useCommand, { isCommand, getCommands } from '../command/command';
import lib, { App } from '../models/app';

import { findClosestWord } from '../utils/word';

const main = (event: any, appId: number) => {
    new Promise(async (resolve, reject) => {
        console.log("EVENT RECEIVED => ", event);

        const app = await lib.getAppById(Number(appId))
        if (!app) return;
        if (!app.ready()) return;
        await app.initialize();

        if (event.type == "postback") return usePostback(event, app);
        if (event.type == "message" && isCommand(event.message.text)) return useCommand(event, app);

        if (!app.client) return;
        const member = await app.getMember(event.source.userId);
        if (!member) return;
        const commands : string[] = [];

        getCommands(member.getPermission()).map((command) => {
            commands.push(...command.command)
        })

        if (event.type == "message" && app.client) {
            const ClosestWord = findClosestWord(event.message.text, commands);
            const quickreplys : QuickReplyItem[] = []

            if (ClosestWord){
                quickreplys.push({
                    type: "action",
                    action: {
                        type: "message",
                        label: "ใช่",
                        text: ClosestWord
                    }
                })
            }

            return app.client.replyMessage(event.replyToken, {
                type: "text",
                text: "ขอโทษค่ะ, ฉันไม่เข้าใจข้อความของคุณ\n" + (ClosestWord ? "คุณหมายถึง " + ClosestWord + " รึป่าวคะ?" : ""),
                quickReply: { 
                    "items": quickreplys
                }
            })
        }
    })
}

export default main