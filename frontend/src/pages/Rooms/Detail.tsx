import { useParams, useNavigate  } from 'react-router-dom'
import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { room, time } from '../../typings/room';

function isTimeInRange(newTime :  [string, string], timeRanges :  [string, string][]) {
    const [newStartTime, newEndTime] = newTime.map(time => convertToSeconds(time));
  
    for (const [startTime, endTime] of timeRanges) {
      if (newStartTime >= convertToSeconds(startTime) && newStartTime <= convertToSeconds(endTime)) {
        return true;
      }
  
      if (newEndTime >= convertToSeconds(startTime) && newEndTime <= convertToSeconds(endTime)) {
        return true;
      }
  
      if (newStartTime <= convertToSeconds(startTime) && newEndTime >= convertToSeconds(endTime)) {
        return true;
      }
    }
  
    return false;
}
  
function convertToSeconds(time : string) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}
  
function convertToTimeString(seconds : number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

const Main = () => {
    const roomId : string | undefined = useParams().id
    const [data, setData] = useState<room>({
        id: 0,
        owner : 0,
        label : ""
    });
    const [times, setTimes] = useState<time[]>([]);
    const navigate = useNavigate();

    const init = () => {
        axios.get(`http://localhost:3000/u/${1}/getRooms/${roomId}`).then((resp) => {
            if (!resp.data[0]){
                return
            } 
            
            setData(resp.data[0])
        })

        axios.get(`http://localhost:3000/room/get/${roomId}`).then((resp) => setTimes(resp.data))
    }

    useEffect(init, []);

    const [startTime, setStart] = useState<string>("06:00:00");
    const [endTime, setEnd] = useState<string>("07:00:00");

    const addTime = (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!startTime) return;
        if (!endTime) return;

        const secStart : number= convertToSeconds(startTime );
        const secEnd  : number= convertToSeconds(endTime );

        if (secStart >= secEnd)return alert("กรุณาป้อนเวลาให้ถูกต้อง");


        const timeRanges : [string, string][] = [];
        times.map((time) => timeRanges.push([time.start, time.end]))

        if (isTimeInRange([startTime, endTime], timeRanges)) return alert("เวลาของคุณทับซ้อนกัน") 
       
        axios.post("http://localhost:3000/room/time/create", {
            room: roomId,
            start: startTime,
            end: endTime
        }).then((resp) => {
            if (resp.status == 200 && resp.data.status == "success"){
                alert("เพิ่มตารางเวลาสำเร็จ");
                init();
            }
        })
    }

    const addMore = (start : string, end : string) => {
        const startSecond = convertToSeconds(start);
        const endSecond = convertToSeconds(end);

        const diffVal = endSecond - startSecond;

        let newStart = endSecond+60;
        let newEnd   = endSecond+60+diffVal;

        if (newStart >= 86400) newStart = 0;
        if (newEnd >= 86400) newEnd = 0;
        

        setStart(convertToTimeString(newStart))
        setEnd(convertToTimeString(newEnd))
    }

    const deleteTime = (id : number) =>{
        axios.post("http://localhost:3000/room/time/delete", {
            id: id
        }).then((resp) =>{
            if (resp.status == 200 && resp.data.status == "success") {
                alert("สำเร็จ!");
            }
        })
    }

    /* BUTTONS */

    const AddMoreButton = (start : string, end : string, index : number, length : number) => {
        if (index >= length-1) return (<button key="addMoreButton" onClick={() => addMore(start, end)}>ADD MORE</button>)
    }

    return (
        <>
            <h1>ROOM DETAIL</h1>
           
            <form onSubmit={addTime}>
                <label htmlFor="start">เริ่มต้น</label>
                <input type="time" name="start" id="start" value={startTime} defaultValue="06:00" onChange={(e) => setStart(e.target.value + ":00")}/>

                <label htmlFor="end">สิ้นสุด</label>
                <input type="time" name="end" id="end" value={endTime} defaultValue="07:00" onChange={(e) => setEnd(e.target.value + ":00")}/>


                <input type="submit" value="เพิ่มตารางเวลา"/>
            </form>
            <hr />
            
            <b>ชื่อ</b> : <span>{data.label}</span>
            <hr />
            <table>
                <caption>ตารางเวลา</caption>
                <thead>
                    <tr>
                        <th>เริ่ม</th>
                        <th>จบ</th>
                        <th>เครื่องมือ</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        times.map((time, index) => {
                            return (
                                <tr key={index}>
                                    <td>{(time.start).substring(0, (time.start).length - 3)}</td>
                                    <td>{(time.end).substring(0, (time.end).length - 3)}</td>
                                    <td>
                                        <button onClick={() => deleteTime(time.id)}>DELETE</button>
                                        {AddMoreButton(time.start, time.end, index, times.length)}
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
           </table>
        </>
    )
}

export default Main