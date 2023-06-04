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
            const date = new Date().toISOString().split('T')[0]

            conn.execute(`
                SELECT 
                    rooms.id,
                    rooms.app,
                    rooms.label,
                    COALESCE(b.count, 0) AS bookings,
                    COALESCE(t.count, 0) AS times
                FROM 
                    rooms
                LEFT JOIN 
                    (
                        SELECT 
                            room, 
                            COUNT(id) AS count
                        FROM 
                            bookings
                        WHERE 
                            status = 0 AND 
                            date = ?
                        GROUP BY room
                    ) b ON 
                        rooms.id = b.room
                LEFT JOIN 
                    (
                        SELECT 
                            room, 
                            COUNT(id) AS count
                        FROM 
                            times
                        WHERE 
                            deleted = 0
                        GROUP BY room
                    ) t ON 
                        rooms.id = t.room
                WHERE 
                    rooms.app = ? AND 
                    rooms.deleted = 0;
                `, [date, app]).then(([rows] : any) => {
                const rooms : room[] = [];

                rows.map((data : any) => {
                    rooms.push({
                        id: data.id,
                        label: data.label,
                        all: data.times,
                        canUse: data.times-data.bookings,
                    })
                })

                resolve(rooms)
            }).catch(reject);
        })
    }
}