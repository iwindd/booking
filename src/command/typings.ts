import {WebhookEvent} from '@line/bot-sdk';
import {Client} from "@line/bot-sdk"
import {App} from '../models/app';

export interface arg{
    name : string,
    type : string,
    required ? : boolean,
}

export interface command{
    command : string | string[],
    args : arg[],
    debouce?: number,
    allowed?:boolean,
    onlyAdmin?: boolean,
    execute : (event : WebhookEvent | any, client : Client, appData : App, args : {[key: string]: any}[]) => void
}

export interface postback{
    name : string,
    execute : (event : WebhookEvent | any, client : Client, appData : App, args : {[key: string]: any}[]) => void
}

export interface PBSessionData{
    start: Date,
    duration: number,
    limit: number,
    debouce: number,
    name: string
}

export interface CmdDebouce{
    last: Date,
    userid: string
}

export interface PBSession {
    data: PBSessionData,
    last: Date,
    val: number
}