import conn from './connection';

export interface time{
    id : number,
    room : number,
    start : string,
    end : string,
    booking : string | null
}

export default {
    getTimes:  (room : number)  => {
        return new Promise(async (resolve, reject)  => {
            conn.execute("SELECT * FROM times WHERE room = ? AND deleted = 0", [room]).then(([rows] : any) => {
                const times : time[] = [];

                rows.map((data : any) => {
                    times.push({
                        id : data.id,
                        room : data.room,
                        start :  (data.start).substring(0, (data.start).length - 3),
                        end : (data.end).substring(0, (data.end).length - 3),
                        booking : data.booking
                    })
                })

                resolve(times)
            }).catch(reject);
        })
    }
}