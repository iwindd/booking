import { command } from '../typings';
import booking from '../../models/booking';

export const main: command = {
    command: "cron",
    args: [],
    allowed: true,
    onlyAdmin: true,
    execute: async (event, client, app) => {
        booking.cron()
    }
} 
