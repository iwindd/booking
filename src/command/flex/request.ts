import { FlexContainer } from "@line/bot-sdk"
import { usePostbackSession } from "../main"

export const RequestFlexMessage = (name: string, data: string, postbackData : Object) : FlexContainer => {
    return {
        "type": "bubble",
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": name,
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
                                    "text": "รายละเอียด",
                                    "color": "#aaaaaa",
                                    "size": "sm",
                                    "flex": 2
                                },
                                {
                                    "type": "text",
                                    "text": data,
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
        },
        "footer": {
            "type": "box",
            "layout": "horizontal",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                        "type": "postback",
                        "label": "ยอมรับ",
                        "data": JSON.stringify({
                            "use": "request",
                            "session": usePostbackSession(-1, 1, 5000),
                            "data": {
                                type: "1",
                                ...postbackData
                            }
                        }),
                    }
                },
                {
                    "type": "button",
                    "style": "secondary",
                    "height": "sm",
                    "action": {
                        "type": "postback",
                        "label": "ลบ",
                        "data": JSON.stringify({
                            "use": "request",
                            "session": usePostbackSession(-1, 1, 5000),
                            "data": {
                                type: "0",
                                ...postbackData
                            }
                        }),
                    }
                }
            ],
            "flex": 0
        }
    }
}