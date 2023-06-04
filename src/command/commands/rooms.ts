import {command} from '../typings';
import roomObj, {room} from '../../models/room';
import { getYMDdate } from '../../utils/date';
import { RoomFlexMessage } from '../flex/rooms';
import { Message } from '@line/bot-sdk';
import { flex } from '../../utils/flex';


export const main : command = {
    command : "ห้องทั้งหมด",
    args: [],
    allowed: true,
    execute: async (event, client, app, args : any) => {
        const rooms = app.getRooms();
        const message = new flex();
        message.setTitle("ห้องทั้งหมด");
        message.setTitleAlign("center");
        const today = getYMDdate(new Date());

        rooms.map((room) => {
            message.add({
                title: room.label,
                align: "center",
                metadata: [
                    {label: "จองห้อง", style: "button", action: {
                        "type": "datetimepicker",
                        "data": JSON.stringify({
                            use: "room",
                            room: room.id
                        }),
                        "initial": today,
                        "min": today,
                        "mode": "date"
                    }}
                ]
            })

        })

        client.replyMessage(event.replyToken, message.render());
    }
} 
