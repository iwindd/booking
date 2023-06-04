import { postback } from "../typings";

export const main : postback = {
    name: "booking",
    execute: async (event, client, app) => {
        const data = JSON.parse(event.postback.data).data;

        app.booking(data.room, data.time, data.date, event.source.userId)
    }
}