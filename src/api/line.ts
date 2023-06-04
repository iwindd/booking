import { execute, isCommand, usePostback } from '../command/main';
import lib, {App} from '../models/app';

const main = (event : any, appId : string) => {
    new Promise(async (resolve, reject) => {
    
        const app = await lib.getAppById(Number(appId))
        if (!app) return;
        if (!app.ready()) return;
    

        if (event.type == "postback") return usePostback(event, app.client, app);
        if (event.type == "message" && isCommand(event.message.text)) return execute(event, app.client, app); 
    })
}


export default main