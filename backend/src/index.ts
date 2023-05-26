import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import cron from 'node-cron';
import lineEvent from './api/line';
import booking from "./models/booking";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* CRON */
const crons : (()=>void)[] = [
    booking.cron
]

cron.schedule('* * * * *', () => crons.map((cron) => cron()));

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
app.get("/", (req, res) => {});

/* SERV */
app.listen(3000, () => console.log("SERVER IS RUNNING."))
