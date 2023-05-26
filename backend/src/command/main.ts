import { readdirSync } from 'fs';
import { join } from 'path';
import {command, arg, postback} from './typings';
import {app} from '../api/line';

const commands: command[] = [];

const cmdFiles: string[] = readdirSync(join(__dirname, 'commands')).filter((file: string) =>
    file.endsWith(".ts"),
);

for (const fileName of cmdFiles) {
    const File = require(`./commands/${fileName}`);
    
    commands.push(File.main);
}

export const isCommand = (message : string) => {
    return message.startsWith('.');
}

export const getCommand = (commandName : string) => {
    return commands.filter((command) => command.command == commandName)[0]
}

export const validate = (command : string, args : string[]) => {
    const data : command = getCommand(command);

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

export const getParams = (command : string) : [string, string[]] => {
    command = command.substring(1);
    const commandParts = command.split(' ');
    
    const commandName = commandParts[0];
    
    // Split the command string by spaces to get the arguments
    const args = command.split(' ');
    
    // Remove the command name from the arguments
    args.shift();
    
    return [commandName, args];
}

export const execute = (event : any, client : any, appData : app) => {
    const message = event.message.text;
    const [name, args] : [string, string[]] = getParams(message);
    
    const argsConfirm : any = validate(name, args);
    const cmd = getCommand(name);
    
    if (argsConfirm === false) return;
    if (!cmd) return;

    console.log(event);
    

    cmd.execute(event, client, appData, argsConfirm);
}

/* POSTBACK */
const postbacks : any= [];

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

export const usePostback = (event : any, client : any, appData : any) => {
    const data = JSON.parse(event.postback.data);

    const postback = getPostback(data.use);

    if (!postback) return;
    if (postback.delete === true){
     /*    client.deleteMessage(event.replyToken, event.message.id); */
        console.log('delete message', event);
        
    }

    postback.execute(event, client, appData)
}
