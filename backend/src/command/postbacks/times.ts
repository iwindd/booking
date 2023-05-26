import { postback } from "../typings";
import { convert, hasThaiNumerals } from '../../utils/dateThai';
import { formatTime, isDateMinToday, mergeDateAndTime } from "../../utils/date";
import timeObj, {time} from '../../models/times';
import { usePostbackSession } from "../main";
import member from "../../models/member";

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
  
        timeObj.getTimes(data.roomId, date).then((times : any) => {
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
                            "text": `< ${data.label}`,
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
    
            times.map( (time : time, index : number) => {
                let timeId = time.id;
                let start = formatTime(time.start);
                let end = formatTime(time.end);

                const options : any = [];
                const action : any = {
                    "type": "postback",
                    "label": `${start}-${end}`,
                    "data": JSON.stringify({
                        "use": "booking_dialogs",
                        "session": usePostbackSession(-1, -1, 5000),
                        "date": date,
                        "start": start,
                        "end": end,
                        "timeId": timeId,
                        "roomId": roomId,
                        "label": (data.label)
                    }),
                };

                const endDate = mergeDateAndTime(date, time.end);
                const now = new Date();

                const isOver    = (endDate < now) ? true:false;
                const isAlready = (!time.users.userid) ? false:true;


                const colorHeader   = isAlready ? "#ff8c00":(isOver ? "#f7686d":undefined)
                const colorStatus   = isAlready ? "#ff8c00":(isOver ? "#f7686d":"#aaaaaa")
                const status        = isAlready ? (time.users.label || "ไม่ทราบชื่อ")  :(isOver ? "เกินเวลา":"ว่าง")
                

                if (!isOver && !isAlready)  options['action'] = action;

               (contents.body.contents[1].contents).push({
                    "type": "box",
                    "layout": "baseline",
                    "contents": [
                        {
                            "type": "text",
                            "text": `${start} - ${end}`,
                            "weight": "bold",
                            "margin": "sm",
                            "color": colorHeader,
                            "flex": 15
                        },
                        {
                            "type": "text",
                            "text": status,
                            "size": "sm",
                            "align": "end",
                            "color": colorStatus,
                            "flex": 15
                        }
                    ],
                    "margin": "15px",
                    ...options
                }, {"type": "separator"})

                quickReply.push({
                    "type": "action", 
                    "action": action
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