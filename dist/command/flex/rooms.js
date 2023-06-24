"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomFlexMessage = void 0;
const date_1 = require("../../utils/date");
const RoomFlexMessage = (name, postbackData) => {
    const today = (0, date_1.getYMDdate)(new Date());
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
    };
};
exports.RoomFlexMessage = RoomFlexMessage;
