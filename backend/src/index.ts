import express, { Request, Response } from "express";
import mysql from 'mysql2';
import bodyParser from "body-parser";

const app = express();
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "bookings"
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req, res) => {});

const useId = 1;

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

/* ROOM MANAGEMENTS */
app.get("/get", (req, resp) => {
    const owner = useId;

    try{
        conn.query("SELECT * FROM rooms WHERE owner = ?", [owner], (err, results) =>{
            return resp.json(!err ? results:"[]");
        })
    }catch(error){
        return resp.send("error")
    }
})

app.post("/create", (req, resp) => {
    const owner = useId;
    const label = req.body.label;

    try{
        conn.query("INSERT INTO rooms (owner, label) VALUES (?, ?)", [owner, label], (err, results) =>{
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

app.post("/delete", (req, resp) => {
    const id = req.body.id;
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
            return resp.send(!err ? "success":"error"+err);
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
            return resp.send(!err ? "success":"error");
        })
    }catch(error){
        return resp.send("error")
    }
})

/* ROOM BOOKING */
app.post("/room/booking", (req, resp) => {
    
})

app.listen(3000, () => console.log("SERVER IS RUNNING."))