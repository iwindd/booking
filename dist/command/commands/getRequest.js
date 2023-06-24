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
exports.main = void 0;
const flex_1 = require("../../utils/flex");
const main_1 = require("../main");
exports.main = {
    command: [
        'ผู้ขอเข้าใช้งานระบบ',
        'ผู้ขอเข้าใช้งาน',
        'คนขอเข้าใช้ระบบ',
        'คนขอเข้าใช้งาน',
        'คนขอเข้าใช้งานระบบ',
        'คนขอเข้าใช้ระบบ',
        'คนขอเข้าใช้งานระบบทั้งหมด',
        'คนขอเข้าใช้งานทั้งหมด'
    ],
    args: [],
    allowed: true,
    onlyAdmin: true,
    debouce: 5000,
    execute: (event, client, app, args) => __awaiter(void 0, void 0, void 0, function* () {
        const members = app.getMembers();
        const requests = members.filter(member => member.allowed == 0);
        if (requests.length > 0) {
            const message = new flex_1.flex();
            message.setTitle("ผู้ขอเข้าใช้งานระบบทั้งหมด");
            requests.map((request) => {
                message.add({
                    title: request.label,
                    metadata: [
                        { style: "list", scale: [1, 1], label: "รายละเอียด", value: request.data },
                        { style: "confirmation",
                            confirmLabel: "ยอมรับ",
                            cancelLabel: "ลบ",
                            confirm: {
                                "type": "postback",
                                "data": JSON.stringify({
                                    "use": "request",
                                    "session": (0, main_1.usePostbackSession)(-1, 1, 5000),
                                    "data": {
                                        type: "1",
                                        userId: request.userid
                                    }
                                }),
                            },
                            cancel: {
                                "type": "postback",
                                "data": JSON.stringify({
                                    "use": "request",
                                    "session": (0, main_1.usePostbackSession)(-1, 1, 5000),
                                    "data": {
                                        type: "0",
                                        userId: request.userid
                                    }
                                }),
                            }
                        }
                    ]
                });
            });
            client.replyMessage(event.replyToken, message.render());
        }
        else {
            client.replyMessage(event.replyToken, {
                type: "text",
                text: "ไม่มีผู้ขอเข้าใช้งาน"
            });
        }
    })
};
