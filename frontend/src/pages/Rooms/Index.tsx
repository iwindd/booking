import {useState, useEffect} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { room } from '../../typings/room';



const Main = () => {
    const [rooms, setRooms] = useState<room[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:3000/get").then((resp) => setRooms(resp.data))
    }, []);

    const deleteRoom = (id : number) => {
        const confirmation = confirm("ยืนยัน");

        if (!confirmation) return;

        axios.post(`http://localhost:3000/delete/${id}`).then((resp) => {
            if (resp.status == 200 && resp.data == "success"){
                alert("สำเร็จ");

                setRooms((old) => {
                    return old.filter((old) => old.id != id);
                })
            }else{
                alert('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!')
            }
        })
    }

    const editRoom = (id : number) => {
        return navigate("/rooms/"+id);
    }

    const addRoom = () => {
        const labelPrompt : string | null = prompt("ป้อนชื่อห้อง");
        if (!labelPrompt) return;

        axios.post("http://localhost:3000/create", {
            label: labelPrompt
        }).then((resp) => {
            if (resp.status == 200 && resp.data == "success"){
                alert("สำเร็จ");
            }else{
                alert('เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!')
            }
        }) 
    }

    return (
        <>
            <h1>CREATE ROOM</h1>
            <button onClick={() => addRoom()}>เพิ่มห้อง</button>
            <hr />
            <table>
                <tr>
                    <th>#</th>
                    <th>ชื่อห้อง</th>
                </tr>
                
                {
                    rooms.map((room) => {
                        return (<>
                            <tr>
                                <td>{room.id}</td>
                                <td>{room.label}</td>
                                <td>
                                    <button onClick={() => deleteRoom(room.id)}>Delete</button>
                                    <button onClick={() => editRoom(room.id)}>เพิ่มเติม</button>
                                </td>
                            </tr>
                        </>)
                    })
                }
            </table>
        </>
    )
}

export default Main