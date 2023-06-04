import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import cron from 'node-cron';
import lineEvent from './api/line';

import * as dotenv from 'dotenv'

const env : any = dotenv.config().parsed
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* CRON */
import BookingModel from "./models/booking";
import AppModel from './models/app';

const crons : (()=>void)[] = [
    BookingModel.cron,
    AppModel.cron
]
cron.schedule('0 * * * *', () => crons.map((cron) => cron()));

/* WEBHOOK */
app.post("/api/:appId/webhook", async(req, res) =>{
    const appId = req.params.appId;

    if (!appId) return;

    try{
        const events = req.body.events;

        return events.length > 0 ? await (events.map((item : any) => lineEvent(item, appId))) :res.sendStatus(200)
    }catch(e){
        res.status(500).end()
    }
})

/* ROUTE */
import RoomController from "./controllers/room";

app.get("/", (req, res) => {
    res.send("OK");
});
app.get('/liff/rooms/', RoomController.getRooms)

/* SERV */
app.listen(env.SERVER_PORT, () => console.log("SERVER IS RUNNING."))
