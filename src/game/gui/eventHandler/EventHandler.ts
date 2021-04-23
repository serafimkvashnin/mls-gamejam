export abstract class EventHandler {

    private _eventList: {[index:string]:((caller:any, args:any)=>void)[]} = {};

    public subscribe(eventName:string, callback:(caller:any, args:any)=>void) {
        if(this._eventList[eventName] == undefined)
            this.registerEventName(eventName);

        this._eventList[eventName].push(callback);
    }
    public registerEventName(eventName: string, forceOverwrite:boolean = false, throwErrorIfExists:boolean = false) {
        if(this._eventList[eventName] != undefined) {
            if(!forceOverwrite && throwErrorIfExists) throw new Error(`Event ${eventName} already registered!`);
            if(!forceOverwrite) return;
        }
        this._eventList[eventName] = [];
    }

    public callEvent(eventName:string, caller:any, args:any, throwErrorIfNotExist:boolean = false) {
        if(this._eventList[eventName] == undefined){
            if(throwErrorIfNotExist) throw new Error(`Event ${eventName} does not exist!`);
            return;
        }
        this._eventList[eventName].forEach(e => {
            e(caller, args);
        })
    }

}