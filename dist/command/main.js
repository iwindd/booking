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
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePostback = exports.usePostbackSession = exports.execute = exports.getParams = exports.validate = exports.getCommand = exports.isCommand = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const uuidv4_1 = require("uuidv4");
const commands = [];
const cmddebouces = [];
const cmdFiles = (0, fs_1.readdirSync)((0, path_1.join)(__dirname, 'commands')).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
for (const fileName of cmdFiles) {
    const File = require(`./commands/${fileName}`);
    commands.push(File.main);
}
const isCommand = (message) => {
    return true; //message.startsWith('.');
};
exports.isCommand = isCommand;
const getCommand = (commandName) => {
    return commands.find((command) => {
        if (Array.isArray(command.command)) {
            return command.command.includes(commandName);
        }
        else {
            return command.command === commandName;
        }
    });
};
exports.getCommand = getCommand;
const validate = (command, args) => {
    const data = (0, exports.getCommand)(command);
    if (!data)
        return false;
    let state = true;
    const confirmArgs = [];
    (data.args).map((arg, index) => {
        let val = args[index];
        const required = arg.required || false;
        if (arg.type == "number")
            val = Number(val);
        if (required && (!val || (arg.type == "number" && isNaN(val)))) {
            return state = false;
        }
        confirmArgs[arg.name] = val;
    });
    if (!state)
        return false;
    return confirmArgs;
};
exports.validate = validate;
const getParams = (command) => {
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
exports.getParams = getParams;
const execute = (event, client, appData) => __awaiter(void 0, void 0, void 0, function* () {
    const message = event.message.text;
    const [name, args] = (0, exports.getParams)(message);
    const argsConfirm = (0, exports.validate)(name, args);
    const cmd = (0, exports.getCommand)(name);
    /* VALIDATE */
    if (!argsConfirm)
        return;
    if (!cmd)
        return;
    /* CHECK DEBOUCE */
    if (cmd.debouce) {
        const debouce = cmddebouces.find((debouce) => debouce.userid == event.source.userId);
        if (!debouce) {
            cmddebouces.push({
                last: new Date(),
                userid: event.source.userId
            });
            setTimeout(() => {
                const index = cmddebouces.findIndex((debouce) => debouce.userid == event.source.userId);
                if (index !== -1) {
                    cmddebouces.splice(index, 1);
                }
            }, cmd.debouce * 3);
        }
        else {
            const now = new Date().getTime();
            if ((now - debouce.last.getTime()) <= cmd.debouce)
                return;
        }
    }
    /* CHECK ALLOWED */
    appData.onInit(() => {
        const userAllowed = appData.isMemberAllowed(event.source.userId);
        if (cmd.allowed === true && !userAllowed)
            return;
        if (cmd.allowed === false && userAllowed)
            return;
        const userIsAdmin = appData.isMemberIsAdmin(event.source.userId);
        if (cmd.onlyAdmin === true && !userIsAdmin)
            return;
        cmd.execute(event, client, appData, argsConfirm);
    });
});
exports.execute = execute;
/* POSTBACK */
const postbacks = [];
const postbacksessions = [];
const postbacksFiles = (0, fs_1.readdirSync)((0, path_1.join)(__dirname, 'postbacks')).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));
for (const fileName of postbacksFiles) {
    const File = require(`./postbacks/${fileName}`);
    postbacks.push(File.main);
}
const getPostback = (postName) => {
    return postbacks.filter((postback) => postback.name == postName)[0];
};
const usePostbackSession = (duration, limit = -1, debouce = 1000) => {
    return {
        "start": new Date(),
        "duration": duration,
        "limit": limit,
        "debouce": debouce,
        "name": (0, uuidv4_1.uuid)()
    };
};
exports.usePostbackSession = usePostbackSession;
const usePostback = (event, client, appData) => {
    const data = JSON.parse(event.postback.data);
    const postback = getPostback(data.use);
    if (!postback)
        return;
    if (data.session) {
        const session = postbacksessions.find((session) => session.data.name == data.session.name);
        const start = new Date(data.session.start).getTime();
        const now = new Date().getTime();
        const timeDiff = now - start;
        const replyMsg = (msg) => {
            if (client)
                client.replyMessage(event.replyToken, {
                    type: "text",
                    text: msg
                });
        };
        if (timeDiff > data.session.duration && data.session.duration != -1)
            return replyMsg("หมดอายุการใช้งานแล้ว!");
        if (!session) {
            postbacksessions.push({
                data: data.session,
                last: new Date(),
                val: 1
            });
            setTimeout(() => {
                const index = postbacksessions.findIndex((session) => session.data.name == data.session.name);
                if (index !== -1) {
                    postbacksessions.splice(index, 1);
                }
            }, data.session.duration + 1000 + (data.session.debouce * 3));
        }
        else {
            if (session.val >= session.data.limit && session.data.limit != -1)
                return;
            if ((now - session.last.getTime()) <= session.data.debouce)
                return;
            session.val += 1;
            session.last = new Date();
        }
    }
    appData.onInit(() => {
        postback.execute(event, client, appData);
    });
};
exports.usePostback = usePostback;
console.log('load commands :', cmdFiles.length);
console.log('load postbacks :', postbacksFiles.length);
