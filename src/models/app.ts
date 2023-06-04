import { formatTime, getYMDdate } from "../utils/date";
import conn from "./connection";
import { Client, Message } from '@line/bot-sdk';

export interface tokens {
    channelAccessToken: string,
    channelSecret: string
}

type group = "user" | "admin" | "all";

export interface member {
    userid: string,
    label: string,
    data: string,
    allowed: number,
    isAdmin: number
}

export interface time {
    id : number,
    start : string,
    end : string
}

export interface rooms {
    id : number,
    label : string,
    times: time[]
}

export interface booking{
    id: number,
    room : number,
    time: number,
    date: string,
    booking: string,
    status: number
}

export class App {
    public id: number;
    public token: tokens;
    public client?: Client;
    public lastActive: Date;

    private member: member[] = [];
    private rooms: rooms[] = [];
    private bookings : booking[] =[];
    
    private init: boolean = false;
    private initCallbacks: (() => void)[] = [];

    constructor(id: number, token: tokens) {
        this.id = id;
        this.token = token;
        this.lastActive = new Date();

        if (!this.token.channelAccessToken) return;
        if (!this.token.channelSecret) return;
        this.client = new Client(this.token);

        this.initialize();
    }

    private async initialize(): Promise<void> {
        // Perform initialization logic here
        const initialize = async () => {
            try {
                const [members]: any = await conn.execute("SELECT userid, label, data, allowed, isAdmin FROM members WHERE app = ?", [this.id]);
                members.map((data: any) => {
                    this.member.push({
                        userid: data.userid,
                        label: data.label,
                        data: data.data,
                        allowed: data.allowed,
                        isAdmin: data.isAdmin
                    });
                });

                const [rooms]: any = await conn.execute("SELECT id, label FROM rooms WHERE app = ? AND deleted = 0", [this.id]);
                const [times]: any = await conn.execute("SELECT room, start, end, id FROM times WHERE app = ? AND deleted = 0", [this.id]);
                rooms.map((data : any) => {
                    const roomsTimes : time[] = [];
                    const filterTimes = times.filter((time : any) => time.room == data.id);

                    filterTimes.map((time : any) => {
                        roomsTimes.push({
                            id: time.id,
                            start: time.start,
                            end: time.end
                        })
                    })

                    this.rooms.push({
                        id: data.id,
                        label: data.label,
                        times: roomsTimes
                    })
                })

                const [bookings]: any = await conn.execute("SELECT id, room, time, date, booking, status FROM bookings WHERE app = ?", [this.id]);
                bookings.map((data: any) => {
                    this.bookings.push({
                        id: data.id,
                        room: data.room,
                        time: data.time,
                        date: getYMDdate(data.date),
                        booking: data.booking,
                        status: data.status
                    })
                })
                
                for (const callback of this.initCallbacks) {
                    callback();
                }
            } catch (error) {
                // Handle the error appropriately
            }
        };

        await initialize();
        this.init = true;
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

    public getMember(identifier : string) : member | undefined{
        return this.member.find(member => member.userid == identifier);
    }

    public getMembers(): member[] {
        return this.member
    }

    public getRooms(): rooms[]{
        return this.rooms
    }

    public setBooking(id : number, attribute : string, value : any) {
        this.bookings.forEach((booking : any) => {
            if (booking.hasOwnProperty(attribute) && booking.id == id){
                booking[attribute] = value;
                return true
            }
        });
    }

    public getBookings(): booking[]{
        return this.bookings
    }

    public getRoom(id : number): rooms | undefined{
        return this.rooms.find(room => room.id == id);
    }

    public isRoomBooking(roomId : number, timeId: number, date: string){
        return this.bookings.find(booking => booking.room == roomId && booking.time == timeId && booking.date == date);
    }

    public booking(roomId : number, timeId : number, date : string, identifier : string){
        const member = this.getMember(identifier);
        const room   = this.getRoom(roomId);
        
        if (!room) return;
        const time   = room.times.find(time => time.id == timeId);
        if (!time) return;
        if (!member) return;
        if (!this.ready()) return;
        if (!this.isMemberAllowed(identifier)) return;
        
        const replyText = (text : string) => this.client?.pushMessage(member.userid, {type: "text", text: text});
        const isBooking = this.isRoomBooking(roomId, timeId, date);
        const key       = `${date}-${this.id}-${room.id}-${time.id}`;    

        if (!isBooking){
            conn.execute("INSERT INTO bookings (bookingKey, room, date, time, booking, app) VALUES (?, ?, ?, ?, ?, ?)", [key, room.id, date, time.id, member.userid, this.id]).then(async (resp : any) => {
                this.client?.pushMessage(member.userid, {type: "text", text: `จองห้อง ${room.label} เวลา ${formatTime(time.start)} - ${formatTime(time.end)} สำเร็จแล้ว`});
                this.send("admin", {type: "text", text: `${member.label} ได้จองห้อง ${room.label} เวลา ${formatTime(time.start)} - ${formatTime(time.end)} แล้ว!`});

                this.bookings.push({
                    id: resp[0].insertId,
                    room: room.id,
                    time: time.id,
                    date: date,
                    booking: identifier,
                    status: 0
                })
            }).catch((err) => {
                replyText("ไม่สามารถจองได้กรุณาลองใหม่อีกครั้งในภายหลัง")
            }) 
        }else{
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

    public addMember(member: member): Promise<void> {
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
            this.member.push(member);
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

    gets: () : App[] => {
        return apps
    },

    cron: () => {
        apps = apps.filter((app) => {
            const now = new Date();
            return now.getTime() - app.lastActive.getTime() < 2 * 60 * (60 * 1000);
        });
    }
}