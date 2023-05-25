import {useState, useEffect} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

interface app{
    id : number,
    owner : number,
    name : string
}

function Main() {
    const [apps, setApps] = useState<app[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:3000/getApps`).then((resp) => {
            if (resp.status == 200 ) setApps(resp.data.data);
        })
    }, []);


    const [appName, setAppName] = useState<string>();

    const AddApp = (e : React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();

        if (!appName) return;

        console.log(appName);
        
        
        axios.post("http://localhost:3000/app/create", {
            appName: appName,
        }).then((resp) => {
            if (resp.status == 200 && resp.data.status == "success"){
                alert("เพิ่มแอพสำเร็จ");
            }
        })
    }

    return (
        <>
            <h1>HOME</h1>
            <form onSubmit={AddApp}>
                <input type="text" placeholder="App Name" onChange={(e : React.ChangeEvent<HTMLInputElement>) => setAppName(e.target.value)} />
                <input type="submit" value="+ App" />            
            </form>
            <hr />
            My Apps

            <table>
                <thead>
                    <th>#</th>
                    <th>ชื่อ</th>
                    <th>เครื่องมือ</th>
                </thead>
                <tbody>
                    {
                        apps.map((app, index) =>{
                            return(
                                <tr key={index}>
                                    <td>{app.id}</td>
                                    <td>{app.name}</td>
                                    <tr>
                                        <button onClick={() => navigate(`rooms/${app.id}`)}>เพิ่มเติม</button>
                                    </tr>
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
