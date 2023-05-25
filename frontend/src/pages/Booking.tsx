import { useEffect, useState } from 'react'
import axios from 'axios';
import { room, time } from '../typings/room';

function Main() {
    const [rooms, setRooms] = useState<room[]>([]);
    const [times, setTimes] = useState<time[]>([]);

    const [room, setRoom] = useState<number>(0);
    const [time, setTime] = useState<number>(0);

    const Booking = (e : React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault()
        const confirmation : boolean = confirm(`คุณต้องการจองห้อง ${room} เวลา ${time} หรือไม่?`);
        if (!confirmation) return;   
    }

/*     useEffect(() => {
        axios.get("http://localhost:3000/getApps").then((resp) => setRooms(resp.data))
    }, []);

    useEffect(() => {
        axios.get(`http://localhost:3000/room/get/${room}`).then((resp) => setTimes(resp.data))
    }, [room])
 */
    return (
        <>
            <form onSubmit={Booking}>
                <select name="room" id="room"   onChange={(e) => setRoom(Number(e.target.value))}>
                    <option value="0">กรุณาเลือกห้องที่คุณต้องการ</option>
                    {
                        rooms.map((data) => {
                            return <option value={data.id}>{data.label}</option>
                        })
                    }
                </select>

                <select name="times" id="times" onChange={(e) => setTime(Number(e.target.value))}>
                    <option value="0">กรุณาเลือกช่วงเวลาที่คุณต้องการ</option>
                    {
                        times.map((data) => {
                            return <option value={data.id}>{data.start} - {data.end}</option>
                        })    
                    }
                </select>

                <input type="submit" value="จองห้อง"/>
            </form>
        </>
    )
}

export default Main
