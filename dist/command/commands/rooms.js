"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const date_1 = require("../../utils/date");
const flex_1 = require("../../utils/flex");
exports.main = {
    command: [
        "ห้องทั้งหมด",
        "ดูห้องทั้งหมด",
        "ดูห้อง",
        "ห้องไหนดี",
        "ห้อง",
        "ขอดูห้องทั้งหมด",
        "ขอดูห้อง",
        "แสดงห้อง",
        "แสดงห้องทั้งหมด"
    ],
    args: [],
    allowed: true,
    execute: (event, client, app, args) => __awaiter(void 0, void 0, void 0, function* () {
        const rooms = app.getRooms();
        const message = new flex_1.flex();
        message.setTitle("ห้องทั้งหมด");
        message.setTitleAlign("center");
        const today = (0, date_1.getYMDdate)(new Date());
        rooms.map((room) => {
            message.add({
                title: room.label,
                align: "center",
                metadata: [
                    { label: "จองห้อง", style: "button", action: {
                            "type": "datetimepicker",
                            "data": JSON.stringify({
                                use: "room",
                                room: room.id
                            }),
                            "initial": today,
                            "min": today,
                            "mode": "date"
                        } }
                ]
            });
        });
        client.replyMessage(event.replyToken, message.render());
    })
};
