import { useState } from 'react'
import './App.css'

function App() {
    const [room, setRoom] = useState(0);
    const [time, setTime] = useState(0);

    const Booking = (e) =>{
        e.preventDefault();
        const confirmation : boolean = confirm(`คุณต้องการจองห้อง ${room} เวลา ${time} หรือไม่?`);

        console.log('booking', confirmation);
    }

    return (
        <>
            <form onSubmit={Booking}>
                <select name="room" id="room"   onChange={(e) => setRoom(Number(e.target.value))}>
                    <option value="0">กรุณาเลือกห้องที่คุณต้องการ</option>
                    <option value="1">ROOM 1</option>
                    <option value="2">ROOM 2</option>
                </select>

                <select name="times" id="times" onChange={(e) => setTime(Number(e.target.value))}>
                    <option value="0">กรุณาเลือกช่วงเวลาที่คุณต้องการ</option>
                    <option value="1">16:30 - 17:30</option>
                    <option value="2">17:30 - 18:30</option>
                </select>

                <input type="submit" value="จองห้อง"/>
            </form>
        </>
    )
}

export default App
