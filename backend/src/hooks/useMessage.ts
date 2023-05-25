class useMessage{
    public state : boolean = false;
    public attributes : any = [];

    constructor(state : boolean = false){
        this.state = state
    }

    set(state : boolean) {
        this.state = state
    }
    
    add(attributeName : string, data : any){

        
        this.attributes.push({key: attributeName, val: data})
    }

    get(){
        let data : any = {
            status : !this.state ? "error":"success",
        }

        this.attributes.map((attribute : any) => {
            data[attribute.key] = attribute.val
        })

        return data 
    }
}

export default useMessage