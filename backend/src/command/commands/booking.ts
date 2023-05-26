import {command} from '../typings';


export const main : command = {
    command : "booking",
    args: [
        {name: "room", type: "number", required: true},
        {name: "date", type: "string", required: true},
        {name: "time", type: "number", required: true}
    ],
    execute: async (event, client, appData, args : any) => {
        if (!event) return;
        if (!event.replyToken) return;
        if (!event.source) return;
        if (!event.source.userId) return;

      
        
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
                      "text": "คุณต้องการที่จะจองห้องคอม 9 หรือไม่ ?",
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
                              "text": "15 ธันวาคม 2567",
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
                              "text": "14:00 - 15:00",
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
                      "color": "#198754",
                      "action": {
                        "type": "postback",
                        "label": "ตกลง",
                        "data": JSON.stringify({
                          "use": "booking",
                          "data": {
                            room: args.room,
                            date: args.date,
                            time: args.time
                          }
                        }),
                      },
                      "margin": "xs"
                    },
                    {
                      "type": "button",
                      "style": "primary",
                      "color": "#dc3545",
                      "action": {
                        "type": "postback",
                        "label": "ยกเลิก",
                        "data": "hello"
                      },
                      "margin": "xs"
                    }
                  ]
                }
            }
        })
    }
} 
