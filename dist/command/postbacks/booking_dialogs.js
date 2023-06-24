"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const date_1 = require("../../utils/date");
const main_1 = require("../main");
exports.main = {
    name: "booking_dialogs",
    execute: (event, client, app) => {
        const data = JSON.parse(event.postback.data);
        const room = app.getRoom(data.data.room);
        if (!room)
            return;
        const time = room.times.find((time) => time.id == data.data.time);
        if (!time)
            return;
        const date = (0, date_1.mergeDateAndTime)(data.data.date, time.start);
        if (!date)
            return;
        client.replyMessage(event.replyToken, {
            type: "flex",
            altText: "ยืนยันการจองห้อง",
            contents: {
                "type": "bubble",
                "header": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": `คุณต้องการที่จะจอง${room.label}หรือไม่ ?`,
                            "maxLines": 5,
                            "wrap": true,
                            "gravity": "center",
                            "align": "start",
                            "style": "normal",
                            "weight": "bold",
                            "size": "xxl",
                            "decoration": "none"
                        }
                    ]
                },
                "body": {
                    "type": "box",
                    "layout": "vertical",
                    "spacing": "md",
                    "contents": [
                        {
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
                                            "text": "วันที่",
                                            "weight": "bold",
                                            "margin": "sm",
                                            "flex": 0
                                        },
                                        {
                                            "type": "text",
                                            "text": date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
                                            "size": "sm",
                                            "align": "end",
                                            "color": "#aaaaaa"
                                        }
                                    ]
                                },
                                {
                                    "type": "separator"
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "เวลา",
                                            "weight": "bold",
                                            "margin": "sm",
                                            "flex": 0
                                        },
                                        {
                                            "type": "text",
                                            "text": `${(0, date_1.formatTime)(time.start)} - ${(0, date_1.formatTime)(time.end)}`,
                                            "size": "sm",
                                            "align": "end",
                                            "color": "#aaaaaa"
                                        }
                                    ]
                                },
                                {
                                    "type": "separator"
                                }
                            ]
                        }
                    ]
                },
                "footer": {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                        {
                            "type": "button",
                            "style": "primary",
                            "action": {
                                "type": "postback",
                                "label": "ยืนยัน",
                                "data": JSON.stringify({
                                    "use": "booking",
                                    "session": (0, main_1.usePostbackSession)(5 * (60 * 1000), 1),
                                    "data": {
                                        room: room.id,
                                        time: time.id,
                                        date: data.data.date
                                    }
                                }),
                            },
                            "margin": "xs"
                        }
                    ]
                }
            }
        });
    }
};
