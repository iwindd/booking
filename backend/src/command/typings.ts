import {WebhookEvent} from '@line/bot-sdk';
import {Client} from "@line/bot-sdk"
import {app} from '../models/app';

export interface arg{
    name : string,
    type : string,
    required ? : boolean
}

export interface command{
    command : string,
    args : arg[],
    execute : (event : WebhookEvent | any, client : Client, appData : app, args : {[key: string]: any}[]) => void
}

export interface postback{
    name : string,
    execute : (event : WebhookEvent | any, client : Client, appData : app, args : {[key: string]: any}[]) => void
}