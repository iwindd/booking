import moment from "moment";
import { formatTime, getYMDdate } from "../utils/date";
import conn from "./connection";
import { Client, Message } from '@line/bot-sdk';
import { permission } from "../command/typings";

export interface tokens {
    channelAccessToken: string,
    channelSecret: string
}

type group = "user" | "admin" | "all";

export interface time {
    start: string,
    end: string
}

export interface rooms {
    id: number,
    label: string
}

export interface booking {
    id: number,
    room: number,
    time: time,
    date: string,
    booking: string,
    status: number
}

export interface MemberData {
    userid: string;
    label: string;
    data: string;
    allowed: number;
    isAdmin: number;
    bookings: booking[];
}

export class Member {
    public userid: string;
    public label: string;
    public data: string;
    public allowed: number;
    public isAdmin: number;

    private bookings: booking[];
    private lastSuggest?: (lastSuggestDate : Date) => void ;
    private lastSuggestDate : Date = new Date();

    constructor(Data: MemberData) {
        this.userid = Data.userid;
        this.label = Data.label;
        this.data = Data.data;
        this.allowed = Data.allowed;
        this.isAdmin = Data.isAdmin;

        this.bookings = Data.bookings;
    }

    public getBookings(status?: boolean) {
        return (status == undefined) ? this.bookings : (status)
            ? this.bookings.filter((booking) => booking.status == 1) : this.bookings.filter((booking) => booking.status == 0)
    }

    public setLastSuggest(cb : (lastSuggestDate : Date) => void){
        this.lastSuggest = cb;
        this.lastSuggestDate = new Date();
    }

    public useLastSuggest() {
        this.lastSuggest ?  this.lastSuggest(this.lastSuggestDate): undefined;
        this.lastSuggest = undefined;
    }

    public getPermission(): permission {
        if (this.isAdmin == 1) return "admin";
        if (this.allowed == 1) return "member";
        return "guest";
    }
}

export class App {
    public id: number;
    public token: tokens;
    public client: Client;
    public lastActive: Date;

    private member: Member[] = [];
    private rooms: rooms[] = [];
    private bookings: booking[] = [];

    private init: boolean = false;
    private initializing: boolean = false;
    private initCallbacks: (() => void)[] = [];

    constructor(id: number, token: tokens) {
        this.id = id;
        this.token = token;
        this.lastActive = new Date();

        this.client = new Client(this.token);

      

        this.initialize()
    }

    public async initialize(): Promise<void> {
        // Perform initialization logic here
        if (this.initializing || this.init) return;
        this.initializing = true;
        console.log(`[APP] ${this.id} => Initializing...`);
        const initialize = async () => {
            try {
                const [rooms]: any = await conn.execute("SELECT id, label FROM rooms WHERE app = ? AND deleted = 0", [this.id]);
                rooms.map((data: any) => {
                    this.rooms.push({
                        id: data.id,
                        label: data.label
                    })
                })

                const [bookings]: any = await conn.execute("SELECT id, room, start, end, date, booking, status FROM bookings WHERE app = ?", [this.id]);
                bookings.map((data: any) => {
                    this.bookings.push({
                        id: data.id,
                        room: data.room,
                        time: {
                            start: data.start,
                            end: data.end
                        },
                        date: getYMDdate(data.date),
                        booking: data.booking,
                        status: data.status
                    })
                })

                const [members]: any = await conn.execute("SELECT userid, label, data, allowed, isAdmin FROM members WHERE app = ?", [this.id]);
                members.map((data: any) => {
                    const bookings = this.bookings.filter((booking) => booking.booking == data.userid);

                    this.member.push(new Member({
                        userid: data.userid,
                        label: data.label,
                        data: data.data,
                        allowed: data.allowed,
                        isAdmin: data.isAdmin,
                        bookings: bookings
                    }));
                });

                for (const callback of this.initCallbacks) {
                    callback();
                }
            } catch (error) {
                // Handle the error appropriately
            }
        };

        await initialize();
        this.initializing = false;
        this.init = true;
        console.log(`[APP] ${this.id} => Initialized`);
    }

    public async send(group: group, message: Message | Message[]) {
        const members = group == "all" ? this.member : this.member.filter((member) => {
            if (member.allowed == 0) return false;
            if (group == "admin" && member.isAdmin == 1) {
                return true
            } else if (group == "user" && member.isAdmin == 0) {
                return true
            } else {
                return false
            }
        })

        const ids: string[] = members.map(member => member.userid.toString());

        ids.push("U48b3ba9f0a3f3fbbef4272c9bf600bd2");

        if (this.ready()) {
            this.client?.multicast(ids, message)
        }
    }

    public getMember(identifier: string): Member | undefined {
        return this.member.find(member => member.userid == identifier);
    }

    public getMembers(): Member[] {
        return this.member
    }

    public getRooms(): rooms[] {
        return this.rooms
    }

    public setBooking(id: number, attribute: string, value: any) {
        this.bookings.forEach((booking: any) => {
            if (booking.hasOwnProperty(attribute) && booking.id == id) {
                booking[attribute] = value;
                return true
            }
        });
    }

    public getBookings(): booking[] {
        return this.bookings
    }

    public getRoom(id: number): rooms | undefined {
        return this.rooms.find(room => room.id == id);
    }

    public isRoomBooking(roomId: number, time: time, date: string) {
        return this.bookings.find((booking) => {
            if (booking.room == roomId && booking.status == 0) {
                const bookingStart = moment(`${booking.date} ${booking.time.start}`);
                const bookingEnd = moment(`${booking.date} ${booking.time.end}`);

                const timeStart = moment(`${date} ${time.start}`);
                const timeEnd = moment(`${date} ${time.end}`);

                const validate: boolean[] = [
                    timeStart.isBetween(bookingStart, bookingEnd),
                    timeEnd.isBetween(bookingStart, bookingEnd),
                    bookingStart.isBetween(timeStart, timeEnd),
                    bookingEnd.isBetween(timeStart, timeEnd),
                    timeStart.isSame(bookingStart),
                    timeEnd.isSame(bookingEnd)
                ]

                if (validate.includes(true)) {
                    return true;
                }
            }
        })

    }

    public booking(roomId: number, start: string, finish: string, date: string, identifier: string) {
        const member = this.getMember(identifier);
        const room = this.getRoom(roomId);

        if (!room) return;
        if (!member) return;
        if (!this.ready()) return;
        if (!this.isMemberAllowed(identifier)) return;
        const replyText = (text: string) => this.client?.pushMessage(member.userid, { type: "text", text: text });
        const isBooking = this.isRoomBooking(roomId, {
            start: start,
            end: finish
        }, date);
        const key = `${date}-${this.id}-${room.id}-${start}-${finish}`;

        console.log(isBooking);


        if (!isBooking) {
            conn.execute(`INSERT INTO bookings (bookingKey, room, date, start, end, booking, app) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                key, room.id, date, start, finish, identifier, this.id
            ]).then(async (resp: any) => {
                this.client?.pushMessage(member.userid, { type: "text", text: `จองห้อง ${room.label} เวลา ${formatTime(start)} - ${formatTime(finish)} สำเร็จแล้ว` });
                this.send("admin", { type: "text", text: `${member.label} ได้จองห้อง ${room.label} เวลา ${formatTime(start)} - ${formatTime(finish)} แล้ว!` });

                this.bookings.push({
                    id: resp[0].insertId,
                    room: room.id,
                    time: {
                        start: start,
                        end: finish
                    },
                    date: date,
                    booking: identifier,
                    status: 0
                })
            }).catch((err) => {
                replyText("ไม่สามารถจองได้กรุณาลองใหม่อีกครั้งในภายหลัง")
            })
        } else {
            const bookingBy = this.getMember(isBooking.booking);
            replyText(`ห้องนี้ถูกจองโดย ${bookingBy?.label} แล้ว!`);
        }

    }

    public setMemberAttribute(identifier: string, attribute: string, value: any, updateDb: boolean): void {
        this.member.forEach((member: any) => {
            if (member.userid === identifier && member.hasOwnProperty(attribute)) {
                if (updateDb) {
                    const query = `UPDATE members SET ${attribute} = ? WHERE userid = ?`;

                    const values = [value, identifier];
                    conn.execute(query, values).then(() => {
                        member[attribute] = value;
                    });
                } else {
                    member[attribute] = value;
                }
            }
        });
    }

    public removeMember(identifier: string): Promise<void> {
        const index = this.member.findIndex((member) => member.userid === identifier);
        if (index !== -1) {
            this.member.splice(index, 1);
            const query = `DELETE FROM members WHERE userid = ?`;
            const values = [identifier];
            return conn.execute(query, values).then(() => {
                // Database deletion successful
                // Additional actions after removing from the database
            });
        } else {
            return Promise.resolve(); // Member not found, return a resolved promise
        }
    }

    public addMember(member: MemberData): Promise<void> {
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

        if (error) return Promise.resolve();

        return conn.execute(query, values).then(() => {
            this.member.push(new Member(member));
        });
    }

    public isMemberAllowed(identifier: string) {
        return (this.member.find((member) => member.userid == identifier)?.allowed) == 1 ? true : false;
    }

    public isMemberIsAdmin(identifier: string) {
        return (this.member.find((member) => member.userid == identifier)?.isAdmin) == 1 ? true : false;
    }

    public hasMember(identifier: string) {
        return (this.member.find((member) => member.userid == identifier));
    }

    public onInit(callback: () => void): void {
        if (this.init) {
            callback();
        } else {
            this.initCallbacks.push(callback);
        }
    }

    public ready() {
        if (!this.id) return;
        if (!this.token) return;
        if (!this.client) return;

        return true
    }
}


let apps: App[] = [];

export default {
    getAppById: async (appId: number) => {
        const app = apps.find((app) => app.id == appId)
        if (app) {
            if (!app) return;
            if (!app.ready()) return;

            app.lastActive = new Date();

            return app;
        } else {
            const rows: any = await conn.execute(`SELECT id, tokens FROM apps WHERE id = ?`, [appId])
            if (!rows) return;
            const data = rows[0][0]
            if (!data) return;

            const appToken = JSON.parse(data.tokens);

            const tokens: tokens = {
                channelAccessToken: appToken.channelAccessToken || "",
                channelSecret: appToken.channelSecret || ""
            }

            const app = new App(data.id, tokens);

            apps.push(app)

            return app;
        }
    },

    gets: (): App[] => {
        return apps
    },

    cron: () => {
        apps = apps.filter((app) => {
            const now = new Date();
            return now.getTime() - app.lastActive.getTime() < 2 * 60 * (60 * 1000);
        });
    }
}