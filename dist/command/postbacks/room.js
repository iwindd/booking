"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const dateThai_1 = require("../../utils/dateThai");
const date_1 = require("../../utils/date");
const flex_1 = require("../../utils/flex");
const main_1 = require("../main");
const moment_1 = __importDefault(require("moment"));
exports.main = {
    name: "room",
    execute: (event, client, app) => {
        const data = JSON.parse(event.postback.data);
        const params = event.postback.params;
        const date = (0, dateThai_1.hasThaiNumerals)(params.date) ? (0, dateThai_1.convert)(params.date) : params.date;
        if (!(0, date_1.isDateMinToday)(date))
            return;
        const room = app.getRoom(data.room);
        if (!room)
            return;
        const message = new flex_1.flex();
        message.setTitle("เวลาทั้งหมด");
        room.times.map((time) => {
            const hasBooking = app.isRoomBooking(room.id, time.id, date);
            const textDate = (new Date(date)).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
            const momentEnd = (0, moment_1.default)(`${date} ${time.end}`);
            const momentCur = (0, moment_1.default)();
            const overtime = !momentEnd.isAfter(momentCur);
            if (!hasBooking && !overtime) {
                message.add({
                    title: `${(0, date_1.formatTime)(time.start)} - ${(0, date_1.formatTime)(time.end)}`,
                    metadata: [
                        { label: "ห้อง", value: room.label, style: "list" },
                        { label: "วันที่", value: textDate, style: "list" },
                        { label: "สถานะ", value: "ว่าง", style: "list" },
                        { label: "จอง", style: "button", action: {
                                type: "postback",
                                data: JSON.stringify({
                                    "use": "booking_dialogs",
                                    "session": (0, main_1.usePostbackSession)(-1, 1, 5000),
                                    "data": {
                                        room: data.room,
                                        time: time.id,
                                        date: date
                                    }
                                }),
                            } },
                    ]
                });
            }
            else {
                if (hasBooking) {
                    const bookingBy = app.getMember(hasBooking.booking);
                    message.add({
                        title: `${(0, date_1.formatTime)(time.start)} - ${(0, date_1.formatTime)(time.end)}`,
                        metadata: [
                            { label: "ห้อง", value: room.label, style: "list" },
                            { label: "วันที่", value: textDate, style: "list" },
                            { label: "สถานะ", value: `ถูกจองโดย : ${bookingBy === null || bookingBy === void 0 ? void 0 : bookingBy.label}`, style: "list" },
                        ]
                    });
                }
                else {
                    message.add({
                        title: `${(0, date_1.formatTime)(time.start)} - ${(0, date_1.formatTime)(time.end)}`,
                        metadata: [
                            { label: "ห้อง", value: room.label, style: "list" },
                            { label: "วันที่", value: textDate, style: "list" },
                            { label: "สถานะ", value: `เกินเวลา`, style: "list" },
                        ]
                    });
                }
            }
        });
        client.replyMessage(event.replyToken, message.render());
    }
};
