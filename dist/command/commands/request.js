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
exports.main = void 0;
const member_1 = __importDefault(require("../../models/member"));
const request_1 = require("../flex/request");
exports.main = {
    command: [
        'ขอเข้าใช้งาน',
        'ขอเข้าใช้งานระบบ',
        'เข้าใช้ระบบ',
        'สมัครยังไง',
        'สมัคร',
        'สมัครเข้าใช้งาน',
        'สมัครเข้าใช้ระบบ',
        'สมัครเข้าใช้งานระบบ',
        'สมัครเข้าใช้งานระบบยังไง',
        'สมัครเข้าใช้งานยังไง'
    ], args: [
        { name: "firstname", type: "string" },
        { name: "lastname", type: "string" },
        { name: "data", type: "string" }
    ],
    debouce: 5000,
    execute: (event, client, app, args) => __awaiter(void 0, void 0, void 0, function* () {
        const displayName = yield member_1.default.GetDisplayName(client, event.source.userid, (`${args.firstname} ${args.lastname}`) || "ไม่มีชื่อ");
        const userId = event.source.userId;
        if (!displayName)
            return;
        if (!userId)
            return;
        if (!app.hasMember(userId)) {
            app.addMember({
                userid: userId,
                label: displayName,
                data: args.data,
                allowed: 0,
                isAdmin: 0
            }).then(() => {
                client.replyMessage(event.replyToken, {
                    type: "text",
                    text: `คุณได้ขอเข้าใช้งานระบบจองห้องด้วยชื่อ ${displayName} (รายละเอียด: ${args.data}) แล้ว!`
                });
                app.send("admin", [
                    {
                        type: "text",
                        text: `${displayName} ได้ขอเข้าใช้งานระบบ`
                    }, {
                        type: "flex",
                        altText: `${displayName} ได้ขอเข้าใช้งานระบบ`,
                        contents: (0, request_1.RequestFlexMessage)(displayName, args.data, {
                            userId: userId
                        })
                    }
                ]);
            });
        }
        else {
            client.replyMessage(event.replyToken, {
                type: "text",
                text: `คุณได้ขอเข้าใช้ระบบของห้องแล้ว`
            });
        }
    })
};
