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
exports.main = {
    name: "request",
    execute: (event, client, app) => __awaiter(void 0, void 0, void 0, function* () {
        const data = JSON.parse(event.postback.data).data;
        const MemberData = app.getMember(data.userId);
        switch (data.type) {
            case "1":
                if (app.isMemberAllowed(data.userId))
                    return;
                app.setMemberAttribute(data.userId, "allowed", 1, true);
                /* ADMIN NOTIFICATION */
                client.replyMessage(event.replyToken, {
                    type: "text",
                    text: `คุณได้อนุญาต ${(MemberData === null || MemberData === void 0 ? void 0 : MemberData.label) || "ไม่ทราบชื่อ"} เข้าใช้งานระบบแล้ว!`
                });
                /* MEMBER NOTIFICATION */
                client.pushMessage(data.userId, {
                    type: "text",
                    text: "คุณได้รับอนุญาตเข้าใช้งานระบบจองห้องแล้ว!"
                });
                break;
            case "0":
                if (!app.hasMember(data.userId))
                    return;
                if (app.isMemberAllowed(data.userId))
                    return;
                /* DELETE */
                app.removeMember(data.userId);
                /* ADMIN NOTIFICATION */
                client.replyMessage(event.replyToken, {
                    type: "text",
                    text: `คุณได้ลบคำขอใช้งานของ ${(MemberData === null || MemberData === void 0 ? void 0 : MemberData.label) || "ไม่ทราบชื่อ"} แล้ว!`
                });
                /* MEMBER NOTIFICATION */
                client.pushMessage(data.userId, {
                    type: "text",
                    text: "คุณถูกปฏิเสธจากการขอเข้าใช้งานระบบ"
                });
                break;
            default:
                break;
        }
    })
};
