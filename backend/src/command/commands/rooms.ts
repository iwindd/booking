import {command} from '../typings';
import roomObj, {room} from '../../models/room';
import { getYMDdate } from '../../utils/date';

export const main : command = {
    command : "rooms",
    args: [],
    execute: async (event, client, appData, args : any) => {
        if (!event) return;
        if (!event.replyToken) return;
        if (!event.source) return;
        if (!event.source.userId) return;

        roomObj.getRooms(appData.id).then((rooms : any) => {
            const quickReply : any = [];
            const today = getYMDdate(new Date());

            const contents : any =  {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": "รายชื่อห้อง",
                            "size": "xl",
                            "weight": "bold"
                        }
                    ]
                }
            }

            rooms.map((room : room) => {
               (contents.body.contents).push({
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "sm",
                    "contents": [

                        {
                            "type": "box",
                            "layout": "baseline",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": room.label,
                                    "weight": "bold",
                                    "margin": "sm",
                                    "flex": 0
                                },
                                {
                                    "type": "text",
                                    "text": `ว่าง : ${room.canUse}/${room.all}`,
                                    "size": "sm",
                                    "align": "end",
                                    "color": "#aaaaaa"
                                }
                            ],
       
                            "action": {
                                "type": "datetimepicker",
                                "label": "วันที่จอง",
                                "data": JSON.stringify({
                                    "use": "rooms",
                                    "roomId": room.id,
                                    "label": room.label
                                }),
                                "initial": today,
                                "min": today,
                                "mode": "date"
                            }
                        }, {"type": "separator"}
                    ]
                });

                quickReply.push({
                    "type": "action", 
                    "action": {
                        "type": "datetimepicker",
                        "label": `${room.label}`,
                        "data": JSON.stringify({
                            "use": "rooms",
                            "roomId": room.id,
                            "label": room.label
                        }),
                        "initial": today,
                        "min": today,
                        "mode": "date"
                    }
                });
            })
    
            client.replyMessage(event.replyToken, {
                type: "flex",
                altText: "ห้องทั้งหมด",
                quickReply:{
                    "items": quickReply
                },
                contents: contents
            })
        })
    }
} 
