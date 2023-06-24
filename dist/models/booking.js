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
const date_1 = require("../utils/date");
const connection_1 = __importDefault(require("./connection"));
const app_1 = __importDefault(require("../models/app"));
const member_1 = __importDefault(require("./member"));
const moment_1 = __importDefault(require("moment"));
exports.default = {
    cron: () => {
        const momentCur = (0, moment_1.default)();
        connection_1.default.execute(`
            SELECT 
                bookings.id,
                bookings.date,
                bookings.booking,
                times.start,
                times.end,
                rooms.label,
                rooms.app,
                members.notification
            FROM
                bookings
            LEFT JOIN rooms ON 
                bookings.room = rooms.id
            LEFT JOIN times ON 
                bookings.time   = times.id AND 
                bookings.room   = times.room
            LEFT JOIN members ON 
                bookings.booking = members.userid
            WHERE 
                bookings.status  = 0 AND
                bookings.date <= ?
        `, [momentCur.format("YYYY-MM-DD")]).then(([bookings]) => {
            const success = [];
            const apps = app_1.default.gets();
            bookings.map((booking) => {
                const momentEnd = (0, moment_1.default)(booking.date);
                const timeString = booking.end;
                const [hours, minutes, seconds] = timeString.split(':');
                momentEnd.set({ hours, minutes, seconds });
                const isEnd = !momentEnd.isAfter(momentCur);
                const app = apps.find(app => app.id == booking.app);
                if (app)
                    app.setBooking(booking.id, "status", 1);
                if (isEnd)
                    success.push(booking.id);
            });
            if (success.length <= 0)
                return;
            const placeholders = success.map(() => '?').join(',');
            connection_1.default.execute(`UPDATE bookings SET status = 1 WHERE id IN (${placeholders})`, success).then((result) => __awaiter(void 0, void 0, void 0, function* () {
                const data = bookings.filter((booking) => success.includes(booking.id));
                data.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
                    let app = apps.find(app => app.id == booking.app);
                    if (!app)
                        app = yield app_1.default.getAppById(booking.app);
                    if (!app)
                        return;
                    if (!app.ready())
                        return;
                    const msg = `การจองห้อง ${booking.label} \nเวลา ${(0, date_1.formatTime)(booking.start)} ถึง ${(0, date_1.formatTime)(booking.end)}\nของคุณได้สิ้นสุดลงแล้ว!`;
                    member_1.default.FullNotification(booking.notification, booking.booking, msg, app.client);
                }));
            }));
        });
    }
};
