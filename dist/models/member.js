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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.member = void 0;
const connection_1 = __importDefault(require("./connection"));
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const GetDisplayName = (client, identifier, label) => __awaiter(void 0, void 0, void 0, function* () {
    if (!label) {
        const profile = yield client.getProfile(identifier);
        if (!profile)
            return "ไม่มีชื่อ";
        return profile.displayName;
    }
    else {
        return label;
    }
});
const Notification = (token, msg) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        if (!token)
            return resolve(false);
        if (!msg)
            return resolve(false);
        const options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${token}`,
            },
        };
        axios_1.default.post('https://notify-api.line.me/api/notify', querystring_1.default.stringify({
            message: msg
        }), options)
            .then(resolve)
            .catch(reject);
    });
});
const BotNotification = (client, target, msg) => {
    return client.pushMessage(target, { "type": "text", "text": msg });
};
const FullNotification = (token, target, msg, client = null) => {
    try {
        Notification(token, msg);
        if (client)
            BotNotification(client, target, msg);
        return true;
    }
    catch (error) {
        return error;
    }
};
const CaseNotification = (token, target, msg, client) => {
    return Notification(token, msg).catch(() => {
        return client.pushMessage(target, { "type": "text", "text": msg });
    });
};
let members = [];
class member {
    constructor(data, client) {
        this.identifier = data.userid;
        this.client = client;
        this.data = data;
    }
    getName() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield GetDisplayName(this.client, this.identifier, this.data.label);
        });
    }
    FullNotification(msg) {
        return FullNotification(this.data.notification, this.identifier, msg, this.client);
    }
    CaseNotification(msg) {
        return CaseNotification(this.data.notification, this.identifier, msg, this.client);
    }
}
exports.member = member;
exports.default = {
    getUser: (identifier, client) => {
        return new Promise((resolve, reject) => {
            const key = client.config.channelAccessToken + client.config.channelSecret;
            const MemberInPool = members.find((member) => member.identifier == identifier && member.clientKey == key);
            if (!MemberInPool) {
                connection_1.default.execute("SELECT * FROM members WHERE userid = ?", [identifier]).then(([data]) => {
                    if (data.length <= 0)
                        return reject("no-found-user");
                    const obj = new member(data[0], client);
                    members.push({
                        lastActive: new Date(),
                        identifier: identifier,
                        clientKey: key,
                        member: obj
                    });
                    resolve(obj);
                }).catch(reject);
            }
            else {
                MemberInPool.lastActive = new Date();
                resolve(MemberInPool);
            }
            members = members.filter((member) => {
                const now = new Date();
                return now.getTime() - member.lastActive.getTime() < 30 * (60 * 1000);
            });
        });
    },
    GetDisplayName: GetDisplayName,
    Notification: Notification,
    CaseNotification: CaseNotification,
    BotNotification: BotNotification,
    FullNotification: FullNotification
};
