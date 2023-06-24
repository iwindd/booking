"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const node_cron_1 = __importDefault(require("node-cron"));
const line_1 = __importDefault(require("./api/line"));
const dotenv = __importStar(require("dotenv"));
const env = dotenv.config().parsed;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
/* CRON */
const booking_1 = __importDefault(require("./models/booking"));
const app_1 = __importDefault(require("./models/app"));
const connection_1 = __importDefault(require("./models/connection"));
const crons = [
    booking_1.default.cron,
    app_1.default.cron
];
node_cron_1.default.schedule('0 * * * *', () => crons.map((cron) => cron()));
/* WEBHOOK */
app.post("/api/:appId/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = req.body.events;
        return events.length > 0 ? yield (events.map((item) => (0, line_1.default)(item, 1))) : res.sendStatus(200);
    }
    catch (e) {
        res.status(500).end();
    }
}));
/* ROUTE */
app.get("/", (req, res) => {
    connection_1.default.getConnection().then((connection) => {
        res.send("CONNECTED");
    }).catch(() => {
        res.send("ERROR");
    });
});
/* SERV */
app.listen(env.SERVER_PORT, () => console.log("SERVER IS RUNNING."));
