import { Time, UniqArray } from "../data";
import { nerdEngine } from "../nerdEngine";
import { TimeToString } from "../utils/utilsText";

export type Stopwatch = {
    ID: string,
    Time: Date,
}


export class StopWatchManager {

    private enabled: boolean;
    private readonly array: UniqArray<Stopwatch>;

    constructor(public readonly Engine?: nerdEngine, enabled = true) {
        this.array = new UniqArray<Stopwatch>([], (a, b) => a.ID == b.ID);
        this.enabled = enabled;
    }

    get Enabled() {
        return this.enabled;
    }

    set Enabled(value) {
        this.enabled = value;
    }

    get Items() {
        return this.array.Items;
    }

    Toggle(id: string, minDuration?: Time) {
        if (!this.enabled) return;
        if (this.Engine && this.Engine.BUILD_MODE != "Preview") return;

        let stopwatch = this.array.Items.find(s => s.ID == id);
        if (!stopwatch) {
            this.Start(id);
        }
        else {
            this.Stop(id, minDuration);
        }
    }

    Start(id: string) {
        if (!this.enabled) return;
        if (this.Engine && !this.Engine.System.Settings.PerformanceStopwatches) {
            return;
        }

        this.array.Add({
            ID: id,
            Time: new Date(),
        })
    }

    Stop(id: string, minDuration?: Time): Time | null {
        if (!this.enabled) return null;
        if (this.Engine && !this.Engine.System.Settings.PerformanceStopwatches) {
            return null;
        }

        let stopwatch = this.array.Items.find(s => s.ID == id);
        if (stopwatch) {
            let diffMs = new Time(0, 0, 0, new Date().getTime() - stopwatch.Time.getTime()).TotalMs.AsNumber;

            let color = "#51d043";

            if (diffMs > 2000) {
                color = "#d04343";
            }
            else if (diffMs > 1000) {
                color = "#e28132";
            }
            else if (diffMs > 500) {
                color = "#e2bc32";
            }

            this.array.Items.splice(this.array.Items.indexOf(stopwatch), 1);

            if (minDuration && diffMs < minDuration.TotalMs.AsNumber) return Time.FromMs(diffMs);

            console.log(`[Performance] Stopwatch '${id}' time: %c${TimeToString(diffMs)}`, `color:${color}`);
            return Time.FromMs(diffMs);
        }
        else throw new Error(`Stopwatch with id '${id}' was not found`);
    }
}