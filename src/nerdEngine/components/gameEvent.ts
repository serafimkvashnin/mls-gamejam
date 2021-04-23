import {Exclude} from "class-transformer";
import { Time, UniqArray } from "../data";
import { GetDateDifferenceTime } from "../utils/utilsMath";
import { LogColored, RemoveSlashN, TimeToString } from "../utils/utilsText";

export type ObserverInfo<Sender, EventArgs> = {
    Observer?: object,
    ID?: string,
    Callback: (sender: Sender, args: EventArgs, obs?: any) => void
}

//todo можно сделать более сложные евенты с сортировкой обсерверов при добавлении?
//todo ну или чтобы ты при добавлении, мог указать, добавлять в конец или в начало
@Exclude()
export class GameEvent<Sender, EventArgs> {
    private observers: UniqArray<ObserverInfo<Sender, EventArgs>>;

    private debug: boolean;
    constructor(debugTime = false) {
        this.observers = new UniqArray<ObserverInfo<Sender, EventArgs>>([],
            (a, b) => {
                if (!a.ID || !b.ID) return false;
                else {
                    return a.ID == b.ID;
                }
            }
        );
        this.debug = debugTime;
    }

    get Observers() {
        return this.observers.Items;
    }

    ClearObservers() {
        this.observers.Items = [];
    }

    Register(callback: (sender: Sender, args: EventArgs, obs?: any) => void, observer?: object, id?: string) {
        this.observers.Add( {
            Observer: observer,
            Callback: callback,
        })
    }

    RemoveObserver(id: string) {
        for (let i = 0; i < this.observers.Items.length; i++){
            let obs = this.observers.Items[i];
            if (obs.ID == id) {
                this.observers.Items.splice(i, 1);
            }
        }
    }

    //note: FOR DEBUG
    List() {
        const getCallbackShort = (f: Function, count = 50): string => {
            let str = f.toString();

            let start = str.indexOf("{")
            if (start == -1) start = str.indexOf(">");
            if (start == -1) start = 0;

            str = str.replaceAll(" ", "");
            str = str.substring(start, start + count);

            return RemoveSlashN(str);
        }

        let items = this.Observers.slice(0);
        let stats = new Map<string, { count: number, obs: ObserverInfo<any, any> }>();

        items.forEach((obs) => {
            const key = getCallbackShort(obs.Callback);
            let data = stats.get(key);
            if (!data) {
                stats.set(key, { count: 1, obs: obs });
            }
            else {
                stats.set(key, { count: data.count + 1, obs: data.obs });
            }
        });

        let total = 0;
        stats.forEach((value, key) => {
            console.log(`ObserversStats: %c${value.count}%c of "${key}"`, `color:${"#43d0f3"};`, `color:${"#fff"};`);
            //console.log(value.obs);
            total += value.count;
        });
        LogColored(`Total count: ${total}`, "#f8dc48")
    }

    Trigger(sender: Sender, args: EventArgs)  {
        if (this.debug) {
            let totalTime = 0;
            for (const obs of this.observers.Items) {
                const before = new Date();
                obs.Callback(sender, args, obs.Observer);
                const diff = GetDateDifferenceTime(before).TotalMs.AsNumber;
                totalTime += diff;

                //if (diff > 10) console.log(`Observer time %c${TimeToString(diff)}`, `color:${"#51d043"}`);
            }
            LogColored(`Event total time: ${TimeToString(totalTime)}`, "#4bffc4");
        }
        else {
            for (const obs of this.observers.Items) {
                obs.Callback(sender, args, obs.Observer);
            }
        }
    }

    static RegisterMultiple(events: GameEvent<any, any>[], callback: (sender: any, args: any) => void) {
        for (const event of events) {
            event.Register((sender, args) => {
                callback(sender, args);
            })
        }
    }

    static RegisterMultipleT<T, U>(events: GameEvent<T, U>[], callback: (sender: T, args: U) => void) {
        for (const event of events) {
            event.Register((sender, args) => {
                callback(sender, args);
            })
        }
    }
}