import {Exclude} from "class-transformer";

export type ObserverInfo<Sender, EventArgs> = {
    Observer?: object,
    ID: string,
    Callback: (sender: Sender, args: EventArgs, obs?: any) => void
}

@Exclude()
export class GameEvent<Sender, EventArgs> {
    private observers: ObserverInfo<Sender, EventArgs>[];

    constructor() {
        this.observers = [];
    }

    get Observers() {
        return this.observers;
    }

    ClearObservers() {
        this.observers = [];
    }

    Register(callback: (sender: Sender, args: EventArgs, obs?: any) => void, observer?: object, id: string = "none") {
        this.observers.push( {
            Observer: observer,
            ID: id,
            Callback: callback,
        })
    }

    RemoveObserver(id: string) {
        for (let i = 0; i < this.observers.length; i++){
            let obs = this.observers[i];
            if (obs.ID == id) {
                this.observers.splice(i, 1);
            }
        }
    }

    Trigger(sender: Sender, args: EventArgs) {
        for (const obs of this.observers) {
            obs.Callback(sender, args, obs.Observer);
        }
    }

    static RegisterMultiple(events: GameEvent<any, any>[], callback: (sender: any, args: any) => void) {
        for (const event of events) {
            event.Register((sender, args) => {
                callback(sender, args);
            })
        }
    }
}