import express, { Request, Response } from "express";
import mysql from 'mysql2';
import bodyParser from "body-parser";
import cors from 'cors';
import cron from 'node-cron';
import useMessage from "./hooks/useMessage";

const app = express();
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bookings"
})

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req, res) => {});

const useId = 1;

/* CRON */

cron.schedule('* * * * *', () => {
    /* CHECK TIMEOUT */
    console.log('running a task every minute');
});

/* AUTH */
app.post("/auth/register", (req, resp) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const insert = conn.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, password], (err, results) => {
            return resp.send(!err ? "success":"error");
        })

    } catch (error) {
        return resp.send("error")
    }
})

app.post("/auth/login", (req, resp) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        conn.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, results) => {
            return resp.send(!err ? "success":"error");
        })
    } catch (error) {
        return resp.send("error")
    }
})

/* APPS MAGEMENTS */

app.get("/getApps",(req, resp) =>{
    const id = useId;

    try{
        conn.query("SELECT * FROM apps WHERE owner = ? AND deleted = 0", [id], (err, results) =>{
            let message = new useMessage();

            if (!err){
                message.set(true);
                message.add("data", results);
            }else{
                resp.send("ERROR :"+ !err + id)
                return resp.sendStatus(500)
            }

            return resp.json(message.get())
        })
    }catch(error){
        return resp.sendStatus(500)
    }
})

app.post("/app/create", (req, resp) => {
    const id = useId;
    const name = req.body.appName

    try{
        try{
            conn.query("INSERT INTO apps (owner, name) VALUES (?, ?)", [id, name], (err, results) =>{
                let message = new useMessage();

                if (!err){
                    message.set(true);
                    message.add("data", results);
                }else{
                    resp.send(err)
                    return resp.sendStatus(500)
                }
    
                return resp.json(message.get())
            })
        }catch(error){
            return resp.send("error")
        }
    }catch(error){
        return resp.sendStatus(500)
    }
})

/* ROOM MANAGEMENTS */

app.get("/u/:appId/getRooms", (req, resp) => {
    const params = {
        appId: req.params.appId
    }

    try{
        conn.query("SELECT * FROM rooms WHERE app = ? AND deleted = 0", [params.appId], (err, results) =>{
            let message = new useMessage();

            if (!err){
                message.set(true);
                message.add("data", results);
            }else{
                return resp.sendStatus(500)
            }

            return resp.json(message.get())
        })
    }catch(error){
        return resp.sendStatus(500)
    }
})

app.get("/u/:appId/getRooms/:roomId", (req, resp) => {
    const params = {
        appId: req.params.appId,
        roomId : req.params.roomId
    }

    try{
        conn.query("SELECT * FROM rooms WHERE app = ? AND id = ? AND deleted = 0", [params.appId, params.roomId], (err, results) =>{
            return resp.json(!err ? results:"[]");
        })
    }catch(error){
        return resp.send("error")
    }
})

app.post("/room/create", (req, resp) => {
    const app = req.body.app;
    const label = req.body.label;

    try{
        conn.query("INSERT INTO rooms (app, label) VALUES (?, ?)", [app, label], (err, results) =>{
            return resp.send(!err ? "success":"error");
        })
    }catch(error){
        return resp.send("error")
    }
})

app.post("/update", (req, resp) => {
    const label = req.body.label;
    const id = req.body.id;
    const owner = useId;

    try{
        conn.query("UPDATE rooms SET label = ? WHERE id = ? AND owner = ?", [label, id, owner], (err, results) => {
            return resp.send(!err ? "success":"error");
        })
    }catch(error){
        return resp.send("error")
    }
})

app.post("/delete/:id", (req, resp) => {
    const id = req.params.id;
    const owner = useId;

    try{
        conn.query("UPDATE rooms SET deleted = 1 WHERE id = ? AND owner = ?", [id, owner], (err, results) => {
            return resp.send(!err ? "success":"error");
        })
    }catch(error){
        return resp.send("error")
    }
})

/* ROOM TIME MANAGEMENTS */
app.post("/room/time/create", (req, resp) => {
    const room = req.body.room
    const start = req.body.start
    const end = req.body.end

    try{
        conn.query("INSERT INTO times (room, start, end) VALUES (?, ?, ?)", [room, start, end], (err, results) =>{
            if (!err){
                return resp.json({
                    status: "success",
                    id: results.insertId
                })
            }else{
                return resp.json({
                    status: "error",
                    data: err
                })
            }
            /* return resp.send(!err ? "success":"error"+err); */
        })
    }catch(error){
        return resp.send("error")
    }
})

app.post("/room/time/update", (req, resp) => {
    const id = req.body.id;
    const start = req.body.start;
    const end = req.body.end;

    try{
        conn.query("UPDATE times SET start = ?, end = ? WHERE id = ? ", [id, start, end], (err, results) => {
            return resp.send(!err ? id:"error");
        })
    }catch(error){
        return resp.send("error")
    }
})

app.post("/room/time/delete", (req, resp) => {
    const id = req.body.id;

    try{
        conn.query("UPDATE times SET deleted = 1 WHERE id = ? ", [id], (err, results) => {
            const message = new useMessage(false);

            if (!err) {
                message.set(true)
            }

            return resp.json(message.get())

           /*  return resp.send(!err ? "success":"error"); */
        })
    }catch(error){
        return resp.send("error")
    }
})

app.get("/room/get/:room", (req, resp) => {
    const id = req.params.room;

    try{
        conn.query("SELECT * FROM times WHERE room = ? AND deleted = 0 ", [id], (err, results) =>{
            return resp.json(!err ? results:"[]");
        })
    }catch(error){
        return resp.send("error")
    }
})

/* ROOM BOOKING */


app.listen(3000, () => console.log("SERVER IS RUNNING."))
