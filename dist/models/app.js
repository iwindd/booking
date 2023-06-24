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
exports.App = void 0;
const date_1 = require("../utils/date");
const connection_1 = __importDefault(require("./connection"));
const bot_sdk_1 = require("@line/bot-sdk");
class App {
    constructor(id, token) {
        this.member = [];
        this.rooms = [];
        this.bookings = [];
        this.init = false;
        this.initCallbacks = [];
        this.id = id;
        this.token = token;
        this.lastActive = new Date();
        if (!this.token.channelAccessToken)
            return;
        if (!this.token.channelSecret)
            return;
        this.client = new bot_sdk_1.Client(this.token);
        this.initialize();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Perform initialization logic here
            const initialize = () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const [members] = yield connection_1.default.execute("SELECT userid, label, data, allowed, isAdmin FROM members WHERE app = ?", [this.id]);
                    members.map((data) => {
                        this.member.push({
                            userid: data.userid,
                            label: data.label,
                            data: data.data,
                            allowed: data.allowed,
                            isAdmin: data.isAdmin
                        });
                    });
                    const [rooms] = yield connection_1.default.execute("SELECT id, label FROM rooms WHERE app = ? AND deleted = 0", [this.id]);
                    const [times] = yield connection_1.default.execute("SELECT room, start, end, id FROM times WHERE app = ? AND deleted = 0", [this.id]);
                    rooms.map((data) => {
                        const roomsTimes = [];
                        const filterTimes = times.filter((time) => time.room == data.id);
                        filterTimes.map((time) => {
                            roomsTimes.push({
                                id: time.id,
                                start: time.start,
                                end: time.end
                            });
                        });
                        this.rooms.push({
                            id: data.id,
                            label: data.label,
                            times: roomsTimes
                        });
                    });
                    const [bookings] = yield connection_1.default.execute("SELECT id, room, time, date, booking, status FROM bookings WHERE app = ?", [this.id]);
                    bookings.map((data) => {
                        this.bookings.push({
                            id: data.id,
                            room: data.room,
                            time: data.time,
                            date: (0, date_1.getYMDdate)(data.date),
                            booking: data.booking,
                            status: data.status
                        });
                    });
                    for (const callback of this.initCallbacks) {
                        callback();
                    }
                }
                catch (error) {
                    // Handle the error appropriately
                }
            });
            yield initialize();
            this.init = true;
        });
    }
    send(group, message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const members = group == "all" ? this.member : this.member.filter((member) => {
                if (member.allowed == 0)
                    return false;
                if (group == "admin" && member.isAdmin == 1) {
                    return true;
                }
                else if (group == "user" && member.isAdmin == 0) {
                    return true;
                }
                else {
                    return false;
                }
            });
            const ids = members.map(member => member.userid.toString());
            ids.push("U48b3ba9f0a3f3fbbef4272c9bf600bd2");
            if (this.ready()) {
                (_a = this.client) === null || _a === void 0 ? void 0 : _a.multicast(ids, message);
            }
        });
    }
    getMember(identifier) {
        return this.member.find(member => member.userid == identifier);
    }
    getMembers() {
        return this.member;
    }
    getRooms() {
        return this.rooms;
    }
    setBooking(id, attribute, value) {
        this.bookings.forEach((booking) => {
            if (booking.hasOwnProperty(attribute) && booking.id == id) {
                booking[attribute] = value;
                return true;
            }
        });
    }
    getBookings() {
        return this.bookings;
    }
    getRoom(id) {
        return this.rooms.find(room => room.id == id);
    }
    isRoomBooking(roomId, timeId, date) {
        return this.bookings.find(booking => booking.room == roomId && booking.time == timeId && booking.date == date);
    }
    booking(roomId, timeId, date, identifier) {
        const member = this.getMember(identifier);
        const room = this.getRoom(roomId);
        if (!room)
            return;
        const time = room.times.find(time => time.id == timeId);
        if (!time)
            return;
        if (!member)
            return;
        if (!this.ready())
            return;
        if (!this.isMemberAllowed(identifier))
            return;
        const replyText = (text) => { var _a; return (_a = this.client) === null || _a === void 0 ? void 0 : _a.pushMessage(member.userid, { type: "text", text: text }); };
        const isBooking = this.isRoomBooking(roomId, timeId, date);
        const key = `${date}-${this.id}-${room.id}-${time.id}`;
        if (!isBooking) {
            connection_1.default.execute("INSERT INTO bookings (bookingKey, room, date, time, booking, app) VALUES (?, ?, ?, ?, ?, ?)", [key, room.id, date, time.id, member.userid, this.id]).then((resp) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                (_a = this.client) === null || _a === void 0 ? void 0 : _a.pushMessage(member.userid, { type: "text", text: `จองห้อง ${room.label} เวลา ${(0, date_1.formatTime)(time.start)} - ${(0, date_1.formatTime)(time.end)} สำเร็จแล้ว` });
                this.send("admin", { type: "text", text: `${member.label} ได้จองห้อง ${room.label} เวลา ${(0, date_1.formatTime)(time.start)} - ${(0, date_1.formatTime)(time.end)} แล้ว!` });
                this.bookings.push({
                    id: resp[0].insertId,
                    room: room.id,
                    time: time.id,
                    date: date,
                    booking: identifier,
                    status: 0
                });
            })).catch((err) => {
                replyText("ไม่สามารถจองได้กรุณาลองใหม่อีกครั้งในภายหลัง");
            });
        }
        else {
            const bookingBy = this.getMember(isBooking.booking);
            replyText(`ห้องนี้ถูกจองโดย ${bookingBy === null || bookingBy === void 0 ? void 0 : bookingBy.label} แล้ว!`);
        }
    }
    setMemberAttribute(identifier, attribute, value, updateDb) {
        this.member.forEach((member) => {
            if (member.userid === identifier && member.hasOwnProperty(attribute)) {
                if (updateDb) {
                    const query = `UPDATE members SET ${attribute} = ? WHERE userid = ?`;
                    const values = [value, identifier];
                    connection_1.default.execute(query, values).then(() => {
                        member[attribute] = value;
                    });
                }
                else {
                    member[attribute] = value;
                }
            }
        });
    }
    removeMember(identifier) {
        const index = this.member.findIndex((member) => member.userid === identifier);
        if (index !== -1) {
            this.member.splice(index, 1);
            const query = `DELETE FROM members WHERE userid = ?`;
            const values = [identifier];
            return connection_1.default.execute(query, values).then(() => {
                // Database deletion successful
                // Additional actions after removing from the database
            });
        }
        else {
            return Promise.resolve(); // Member not found, return a resolved promise
        }
    }
    addMember(member) {
        const userid = member.userid;
        const id = this.id;
        const label = member.label;
        const data = member.data;
        const allowed = member.allowed;
        const admin = member.isAdmin;
        if (this.member.find((m) => m.userid === userid)) {
            return Promise.resolve(); // Member already exists, return a resolved promise
        }
        const query = `INSERT INTO members (userid, app, label, data, allowed, isAdmin) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [userid, id, label, data, allowed, admin];
        let error = values.find((val) => !val);
        if (error)
            return Promise.resolve();
        return connection_1.default.execute(query, values).then(() => {
            this.member.push(member);
        });
    }
    isMemberAllowed(identifier) {
        var _a;
        return ((_a = this.member.find((member) => member.userid == identifier)) === null || _a === void 0 ? void 0 : _a.allowed) == 1 ? true : false;
    }
    isMemberIsAdmin(identifier) {
        var _a;
        return ((_a = this.member.find((member) => member.userid == identifier)) === null || _a === void 0 ? void 0 : _a.isAdmin) == 1 ? true : false;
    }
    hasMember(identifier) {
        return (this.member.find((member) => member.userid == identifier));
    }
    onInit(callback) {
        if (this.init) {
            callback();
        }
        else {
            this.initCallbacks.push(callback);
        }
    }
    ready() {
        if (!this.id)
            return;
        if (!this.token)
            return;
        if (!this.client)
            return;
        return true;
    }
}
exports.App = App;
let apps = [];
exports.default = {
    getAppById: (appId) => __awaiter(void 0, void 0, void 0, function* () {
        const app = apps.find((app) => app.id == appId);
        if (app) {
            if (!app)
                return;
            if (!app.ready())
                return;
            app.lastActive = new Date();
            return app;
        }
        else {
            const rows = yield connection_1.default.execute(`SELECT id, tokens FROM apps WHERE id = ?`, [appId]);
            if (!rows)
                return;
            const data = rows[0][0];
            if (!data)
                return;
            const appToken = JSON.parse(data.tokens);
            const tokens = {
                channelAccessToken: appToken.channelAccessToken || "",
                channelSecret: appToken.channelSecret || ""
            };
            const app = new App(data.id, tokens);
            apps.push(app);
            return app;
        }
    }),
    gets: () => {
        return apps;
    },
    cron: () => {
        apps = apps.filter((app) => {
            const now = new Date();
            return now.getTime() - app.lastActive.getTime() < 2 * 60 * (60 * 1000);
        });
    }
};
