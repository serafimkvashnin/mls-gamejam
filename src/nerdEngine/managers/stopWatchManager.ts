import {Time} from "../data";
import { nerdEngine } from "../nerdEngine";
import { TimeToString } from "../utils/utilsText";

export type Stopwatch = {
    ID: string,
    Time: Date,
}


export class StopWatchManager {

    private readonly list: Stopwatch[];

    constructor(public readonly Engine: nerdEngine) {
        this.list = [];
    }

    get List() {
        return this.list;
    }

    Toggle(id: string) {
        if (this.Engine.BUILD_MODE != "Preview") return;

        let stopwatch = this.list.find(s => s.ID == id);
        if (!stopwatch) {
            this.Start(id);
        }
        else {
            this.Stop(id);
        }
    }

    Start(id: string) {
        if (!this.Engine.System.Settings.PerformanceStopwatches) {
            return;
        }

        this.list.push({
            ID: id,
            Time: new Date(),
        })
    }

    Stop(id: string) {
        if (!this.Engine.System.Settings.PerformanceStopwatches) {
            return;
        }

        let stopwatch = this.list.find(s => s.ID == id);
        if (stopwatch) {
            let diff = new Time(0, 0, 0, new Date().getTime() - stopwatch.Time.getTime());


            console.log(`[Performance] Stopwatch '${id}' time: ${TimeToString(diff)}`);
            this.list.splice(this.list.indexOf(stopwatch), 1);
        } else throw new Error(`Stopwatch with id '${id}' was not found`);
    }
}