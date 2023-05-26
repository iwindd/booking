import conn from './connection';

export interface room{
    id : number,
    label : string,
    all : number,
    canUse : number
}

export default {
    getRooms:  (app : number)  => {
        return new Promise(async (resolve, reject)  => {
            conn.execute("SELECT * FROM rooms WHERE app = ? AND deleted = 0", [app]).then(([rows] : any) => {
                const rooms : room[] = [];

                rows.map((data : any) => {
                    rooms.push({
                        id: data.id,
                        label: data.label,
                        all: 0,
                        canUse: 0
                    })
                })

                resolve(rooms)
            }).catch(reject);
        })
    }
}