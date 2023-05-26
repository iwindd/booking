import { execute, isCommand, usePostback } from '../command/main';
import lib from '../models/app';

const main = (event : any, appId : string) => {
    const app = lib.getAppById(Number(appId))

    if (!app?.client) return;

    if (event.type == "postback") return usePostback(event, app?.client, app);
    if (event.type == "message" && isCommand(event.message.text)) return execute(event, app?.client, app); 
}


export default main