import { postback } from "../typings";
import { convert, hasThaiNumerals } from '../../utils/dateThai';
import { isDateMinToday } from "../../utils/date";

import timeObj, {time} from '../../models/times';

export const main : postback = {
    name: "rooms",
    execute: (event, client, appData) => {
        if (!event) return;
        if (!event.replyToken) return;
        if (!event.source) return;
        if (!event.source.userId) return;

        const data = JSON.parse(event.postback.data);
        const params = event.postback.params;

        const date = hasThaiNumerals(params.date) ? convert(params.date):params.date;

        if (!isDateMinToday(date)) return;
  
        timeObj.getTimes(data.roomId).then((times : any) => {
            const quickReply : any = [
                {
                    "type": "action", 
                    "action": {
                      "type": "message",
                      "label": `ดูห้องอื่นๆ `,
                      "text": `.rooms`
                    }
                }
            ];
            const contents : any =  {
                "type": "bubble",
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
                            "type": "text",
                            "text": "< ห้องคอม 3",
                            "size": "xl",
                            "weight": "bold",
                            "action": {
                                "type": "message",
                                "label": ".rooms",
                                "text": ".rooms"
                            }
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "sm",
                            "contents": []
                        }
                    ]
                }
            }
            let roomId = data.roomId;
    
            times.map((time : time, index : number) => {
                let timeId = time.id;
                let start = time.start;
                let end = time.end;
                let i = index+1;
                
               (contents.body.contents[1].contents).push({
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                        {
                            "type": "text",
                            "text": `${start} - ${end}`,
                            "weight": "bold",
                            "margin": "sm",
                            "flex": 15
                        },
                        {
                            "type": "text",
                            "text": "ว่าง",
                            "size": "sm",
                            "align": "end",
                            "color": "#aaaaaa",
                            "flex": 15
                        }
                    ],
                    "action": {
                        "type": "message",
                        "text": `.booking ${roomId} ${date} ${timeId}`,
                        "label": `.booking ${roomId} ${date} ${timeId}`
                    },
                    "margin": "15px"
                }, {"type": "separator"})

                quickReply.push({
                    "type": "action", 
                    "action": {
                      "type": "message",
                      "label": `${start}-${end}`,
                      "text": `.booking ${roomId} ${date} ${timeId}`
                    }
                });
            })
    
            client.replyMessage(event.replyToken, {
                type: "flex",
                altText: "ตารางเวลา",
                quickReply:{
                    "items": quickReply
                },
                contents: contents
            })
        })
    }
}