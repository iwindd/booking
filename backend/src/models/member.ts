import { Client } from "@line/bot-sdk";
import conn from "./connection";

const GetDisplayName = async(client : Client, identifier : string, label : string) => {
    if (!label){
        const profile = await client.getProfile(identifier);

        if (!profile) return "ไม่มีชื่อ";

        return profile.displayName;
    }else{
        return label
    }
}

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
}

export default {
    getUser: (identifier : string, client : Client) => {
        return new Promise((resolve, reject) => {
            conn.execute("SELECT * FROM members WHERE userid = ?", [identifier]).then(([data] : any) => {
                if (data.length <= 0) return reject("no-found-user");

                resolve(new member(data[0], client));
            }).catch(reject)
        })
    },
    
    GetDisplayName : GetDisplayName
}