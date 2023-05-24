export interface room{
    id : number,
    owner : number,
    label : string
}

export interface time{
    id : number,
    room : number,
    start : string,
    end : string,
    booking : string
}

