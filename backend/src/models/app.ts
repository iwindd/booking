import conn from "./connection";
import { Client } from '@line/bot-sdk';

export interface tokens{
    channelAccessToken: string,
    channelSecret: string
}

export interface app{
    id: number,
    token: tokens,
    client?:any
}

const apps : app[] = [];
conn.execute("SELECT id, tokens FROM apps").then(([rows] : any) => rows.map((data : any) => {
    const appToken = JSON.parse(data.tokens);

    apps.push({
        id: data.id, 
        token: {
            channelAccessToken: appToken.channelAccessToken || "",
            channelSecret: appToken.channelSecret || ""
        }
    })
}))

export default {
    getAppById:  (appId : number)  => {
        const app = apps.filter((app) => app.id == Number(appId))[0];
        if (!app) return;
        if (!app.token.channelAccessToken) return;
        if (!app.token.channelSecret) return;
    
        let client = app.client;
    
        if (!app.client){
            client = new Client(app.token);
    
            apps.forEach((data) => {
                if (data.id == Number(appId)) data.client = client   
            });
        }

        return app;
    },

    getAppByTokens: (tokens : tokens) =>{

    }
}