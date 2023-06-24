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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const date_1 = require("../../utils/date");
const flex_1 = require("../../utils/flex");
const moment_1 = __importDefault(require("moment"));
exports.main = {
    command: [
        "การจองของฉัน",
        "ดูประวัติการจอง",
        "ดูการจอง",
        "ดูการจองของฉัน",
        "ดูการจองของฉันทั้งหมด",
        "แสดงประวิติการจอง",
        "แสดงประวิติการจองของฉัน",
        "แสดงประวิติการจองของฉันทั้งหมด",
        "ขอดูประวิติการจองของฉัน",
        "ขอดูประวิติการจองของฉันทั้งหมด",
        "ประวัติ",
        "รายการจองทั้งหมด",
        "ขอดูประวัติการจอง",
        "ขอดูประวัติการจองของฉัน"
    ],
    args: [],
    allowed: true,
    execute: (event, client, app) => __awaiter(void 0, void 0, void 0, function* () {
        const bookings = app.getBookings();
        const filter = bookings.filter(booking => booking.booking == event.source.userId);
        const message = new flex_1.flex();
        message.setTitle("การของของฉัน");
        filter.map((booking) => {
            const room = app.getRoom(booking.room);
            if (!room)
                return;
            const time = room.times.find(time => time.id == booking.time);
            if (!time)
                return;
            const momentEnd = (0, moment_1.default)(`${booking.date} ${time.end}`);
            const momentCur = (0, moment_1.default)();
            const isEnd = !momentEnd.isAfter(momentCur);
            if (!isEnd) {
                message.add({
                    title: room.label,
                    metadata: [
                        { label: "วันที่", value: (new Date(booking.date)).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }), style: "list" },
                        { label: "เวลา", value: `${(0, date_1.formatTime)(time.start)} - ${(0, date_1.formatTime)(time.end)}`, style: "list" }
                    ]
                });
            }
        });
        if (message.isEmpty()) {
            message.add({
                title: "ไม่มีการจอง",
                align: "center",
                metadata: []
            });
        }
        client.replyMessage(event.replyToken, message.render());
    })
};
