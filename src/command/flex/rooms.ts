import { FlexContainer } from "@line/bot-sdk"
import { usePostbackSession } from "../main"
import { getYMDdate } from "../../utils/date";

export const RoomFlexMessage = (name: string, postbackData: Object): FlexContainer => {
    const today = getYMDdate(new Date());

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
                    "size": "xl",
                    "align": "center"
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
                {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                        "type": "datetimepicker",
                        "label": `เลือก`,
                        "data": JSON.stringify(postbackData),
                        "initial": today,
                        "min": today,
                        "mode": "date"
                    }
                },
                {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [],
                    "margin": "sm"
                }
            ],
            "flex": 0
        }
    }
}