import RoomModel from '../models/room'
import { Request, Response } from "express"

export default {
    getRooms: async (req : Request, res : Response) => {
        RoomModel.getRooms(1).then((data) => {
            res.json(data)
        }).catch(() => {
            res.sendStatus(500)
        })
    }
}