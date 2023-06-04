import { readdirSync } from 'fs';
import { join } from 'path';
import {command, CmdDebouce, postback, PBSession, PBSessionData} from './typings';
import {App} from '../models/app';
import { uuid } from 'uuidv4';
const commands: command[] = [];
const cmddebouces: CmdDebouce[] = [];

const cmdFiles: string[] = readdirSync(join(__dirname, 'commands')).filter((file: string) =>
    file.endsWith(".ts"),
);

for (const fileName of cmdFiles) {
    const File = require(`./commands/${fileName}`);
    
    commands.push(File.main);
}

export const isCommand = (message : string) => {
    return true//message.startsWith('.');
}

export const getCommand = (commandName : string) => {
    return commands.find((command) => {
        if (Array.isArray(command.command)) {
            return command.command.includes(commandName);
        } else {
            return command.command === commandName;
        }
    });
}

export const validate = (command : string, args : string[]) => {
    const data : command | undefined = getCommand(command);

    if (!data) return false;

    let state = true;
    const confirmArgs : any = [];

    (data.args).map((arg, index) => {
        let val : any = args[index];
        const required = arg.required || false;

        if (arg.type == "number") val = Number(val);

        if (required && (!val || (arg.type == "number" && isNaN(val)))  ) {
            return state = false
        }       
        
        confirmArgs[arg.name] = val;
    })

    if (!state) return false

    return confirmArgs
}

export const getParams = (command: string): [string, string[]] => {
    //command = command.substring(1);
    const commandParts = command.split(' ');
  
    const commandName = commandParts[0];
  
    const argsString = commandParts.slice(1).join(' ');
  
    // Split the arguments string while considering quoted arguments
    const args = argsString.match(/("[^"]+"|[^"\s]+)/g) || [];
  
    /* REMOVE " " */
    const cleanedArgs = args.map(arg => arg.replace(/^"(.*)"$/, '$1'));

    return [commandName, cleanedArgs];
};

export const execute = async (event : any, client : any, appData : App) => {
    const message = event.message.text;
    const [name, args] : [string, string[]] = getParams(message);
    
    const argsConfirm : any = validate(name, args);
    const cmd = getCommand(name);
    
    /* VALIDATE */
    if (!argsConfirm) return;
    if (!cmd) return;

    /* CHECK DEBOUCE */
    if(cmd.debouce){
        const debouce = cmddebouces.find((debouce) => debouce.userid == event.source.userId);
        if (!debouce){
            cmddebouces.push({
                last: new Date(),
                userid: event.source.userId
            });

            setTimeout(() => {
                const index = cmddebouces.findIndex((debouce) => debouce.userid == event.source.userId);

                if (index !== -1) {
                    cmddebouces.splice(index, 1);
                }
            }, cmd.debouce*3)
        }else{
            const now = new Date().getTime();
            if ((now - debouce.last.getTime()) <= cmd.debouce) return;
        }
    }

    /* CHECK ALLOWED */
    appData.onInit(() => {
        const userAllowed = appData.isMemberAllowed(event.source.userId);
        if (cmd.allowed === true && !userAllowed) return;
        if (cmd.allowed === false && userAllowed) return;

        const userIsAdmin = appData.isMemberIsAdmin(event.source.userId);
        if (cmd.onlyAdmin === true && !userIsAdmin) return;

        cmd.execute(event, client, appData, argsConfirm);
    })
}

/* POSTBACK */
const postbacks : any= [];
const postbacksessions : PBSession[] = [];

const postbacksFiles: string[] = readdirSync(join(__dirname, 'postbacks')).filter((file: string) =>
    file.endsWith(".ts"),
);

for (const fileName of postbacksFiles) {
    const File = require(`./postbacks/${fileName}`);
    
    postbacks.push(File.main);
}

const getPostback = (postName : string) => {
    return postbacks.filter((postback : postback) => postback.name == postName)[0]
}

export const usePostbackSession = (duration : number, limit : number = -1, debouce : number = 1000) : PBSessionData => {
    return {
        "start" : new Date(),
        "duration": duration,
        "limit": limit,
        "debouce": debouce,
        "name": uuid()
    }
}

export const usePostback = (event : any, client : any, appData : any) => {
    const data = JSON.parse(event.postback.data);
    const postback = getPostback(data.use);

    if (!postback) return;
    if (data.session) {
        const session = postbacksessions.find((session) => session.data.name == data.session.name);

        const start = new Date(data.session.start).getTime();
        const now = new Date().getTime();
        const timeDiff = now-start;

        const replyMsg = (msg : string) => {
            if (client) client.replyMessage(event.replyToken, {
                type:"text",
                text: msg
            })
        }

        if (timeDiff > data.session.duration && data.session.duration != -1) return replyMsg("หมดอายุการใช้งานแล้ว!");

        if (!session){
            postbacksessions.push({
                data: data.session,
                last: new Date(),
                val: 1
            })

            setTimeout(() => {
                const index = postbacksessions.findIndex((session) => session.data.name == data.session.name);

                if (index !== -1) {
                    postbacksessions.splice(index, 1);
                }
            }, data.session.duration + 1000 + (data.session.debouce*3) )
        }else{
            if (session.val >= session.data.limit && session.data.limit != -1) return;
            if ((now - session.last.getTime()) <= session.data.debouce) return;
      
            session.val += 1;
            session.last = new Date();
        }

        
    }

    appData.onInit(() => {
        postback.execute(event, client, appData)
    })
}
