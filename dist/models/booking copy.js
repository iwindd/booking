"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("../models/app"));
const moment_1 = __importDefault(require("moment"));
const connection_1 = __importDefault(require("./connection"));
const date_1 = require("../utils/date");
exports.default = {
    cron: () => {
        const apps = app_1.default.gets();
        const updated = [];
        apps.map((app) => {
            const bookings = app.getBookings().filter(booking => booking.status == 0);
            bookings.map((booking) => {
                var _a;
                const room = app.getRoom(booking.id);
                const time = room === null || room === void 0 ? void 0 : room.times.find(time => time.id == booking.time);
                if (!room)
                    return;
                if (!time)
                    return;
                const momentEnd = (0, moment_1.default)(`${booking.date} ${time.end}`);
                const momentCur = (0, moment_1.default)();
                const isEnd = !momentEnd.isAfter(momentCur);
                if (isEnd) {
                    app.setBooking(booking.id, "status", 1);
                    updated.push(booking.id);
                    (_a = app.client) === null || _a === void 0 ? void 0 : _a.pushMessage(booking.booking, {
                        type: "text",
                        text: `การจองห้อง ${room.label} เวลา ${(0, date_1.formatTime)(time.start)}-${(0, date_1.formatTime)(time.end)} ได้สิ้นสุดลงแล้ว!`
                    }, true);
                }
            });
        });
        if (updated.length <= 0)
            return;
        const placeholders = updated.map(() => '?').join(',');
        connection_1.default.execute(`UPDATE bookings SET status = 1 WHERE id IN (${placeholders})`, updated);
    }
};
