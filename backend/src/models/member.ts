import { Client } from "@line/bot-sdk";
import conn from "./connection";
import axios from 'axios';
import qs from 'querystring';

const GetDisplayName = async(client : Client, identifier : string, label : string) => {
    if (!label){
        const profile = await client.getProfile(identifier);

        if (!profile) return "ไม่มีชื่อ";

        return profile.displayName;
    }else{
        return label
    }
}

const Notification = async (token: string, msg: string) => {
    return new Promise((resolve, reject) => {
        if (!token) reject('no-token');
        if (!msg) reject('no-msg');
    
        const options = {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${token}`,
            },
        };
    
        axios.post('https://notify-api.line.me/api/notify', qs.stringify({
            message: msg
        }), options)
            .then(resolve)
            .catch(reject);
    });
  };

const BotNotification = (client : Client, target : string, msg : string) =>{
    return client.pushMessage(target, {"type":"text","text":msg})
}

const FullNotification = (token : string, target : string, msg : string, client : Client) => {
    try {
        Notification(token, msg)
        BotNotification(client, target, msg)

        return true
    } catch (error) {
        return error
    }
}

const CaseNotification = (token : string, target : string, msg : string, client : Client) => {
    return Notification(token, msg).catch(() => {
        return client.pushMessage(target, {"type":"text","text":msg})
    });
}



interface pool{
    lastActive: Date,
    identifier: string,
    clientKey: string,
    member: member
}

let members: pool[] = [];

export class member{
    public identifier : string;
    private client : Client;
    private data : any;

    constructor (data : any, client : Client){
        this.identifier = data.userid;
        this.client = client;

        this.data = data;
    }

    public async getName(){
        return await GetDisplayName(this.client, this.identifier, this.data.label)
    }
    
    public FullNotification(msg : string) {
        return FullNotification(this.data.notification, this.identifier, msg, this.client)
    }

    public CaseNotification(msg : string){
        return CaseNotification(this.data.notification, this.identifier, msg, this.client)
    }
}

export default {
    getUser: (identifier : string, client : Client) => {
        return new Promise((resolve, reject) => {
            const key = client.config.channelAccessToken+client.config.channelSecret;
            const MemberInPool = members.find((member) => member.identifier == identifier && member.clientKey == key);
            
            if (!MemberInPool){
                conn.execute("SELECT * FROM members WHERE userid = ?", [identifier]).then(([data] : any) => {
                    if (data.length <= 0) return reject("no-found-user");
                    const obj = new member(data[0], client);
                    members.push({
                        lastActive: new Date(),
                        identifier: identifier,
                        clientKey: key,
                        member: obj
                    });
                    
                    resolve(obj);
                }).catch(reject)
            }else{
                MemberInPool.lastActive = new Date();
                
                resolve(MemberInPool);
            }

            members = members.filter((member) => {
                const now = new Date();
                return now.getTime() - member.lastActive.getTime() < 30 * (60 * 1000);
            });
        })
    },
    
    GetDisplayName : GetDisplayName,
    Notification: Notification,
    CaseNotification: CaseNotification,
    BotNotification: BotNotification,
    FullNotification: FullNotification
}