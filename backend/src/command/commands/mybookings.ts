import {command} from '../typings';
import bookingObj, {booking} from '../../models/booking';
import { formatTime } from '../../utils/date';

export const main : command = {
    command : "mybookings",
    args: [],
    execute: async (event, client, appData, args : any) => {
        const contents : any = {
            "type": "bubble",
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": "การจองของฉัน",
                        "weight": "bold",
                        "size": "xxl"
                    },
                    {
                        "type": "box",
                        "layout": "vertical",
                        "contents": []
                    }
                ],
                "spacing": "md"
            }
        };

        bookingObj.getBookings(appData.id, event.source.userId).then((rows : any) => {

            rows.map((booking : booking) => {
                (contents.body.contents[1].contents).push({
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                        {
                            "type": "text",
                            "text": booking.label,
                            "weight": "bold",
                            "size": "xl"
                        },
                        {
                            "type": "box",
                            "layout": "vertical",
                            "margin": "lg",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "วันที่",
                                            "color": "#aaaaaa",
                                            "size": "sm",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text":  booking.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
                                            "wrap": true,
                                            "color": "#666666",
                                            "size": "sm",
                                            "flex": 5
                                        }
                                    ]
                                },
                                {
                                    "type": "box",
                                    "layout": "baseline",
                                    "spacing": "sm",
                                    "contents": [
                                        {
                                            "type": "text",
                                            "text": "เวลา",
                                            "color": "#aaaaaa",
                                            "size": "sm",
                                            "flex": 1
                                        },
                                        {
                                            "type": "text",
                                            "text": `${formatTime(booking.start)} - ${formatTime(booking.end)}`,
                                            "wrap": true,
                                            "color": "#666666",
                                            "size": "sm",
                                            "flex": 5
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }, { "type": "separator", "margin": "md" })
            })


            client.replyMessage(event.replyToken, {
                type: "flex",
                altText: "การจองของฉัน",
                contents: contents
            })
        });


    }
} 
