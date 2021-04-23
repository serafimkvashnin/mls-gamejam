import {Time} from "../data";

export type ActionWithIntervalCallback = (sender: ActionsWithInterval) => void;

export class ActionsWithInterval {

    private startedOn: Date | null;
    private isStarted: boolean;
    public readonly Duration: Time;
    private interval: Time;
    public readonly Action: ActionWithIntervalCallback;
    public readonly OnFinished?: ActionWithIntervalCallback;

    public readonly IntervalChange: Time;

    constructor(duration: Time, interval: Time, autoStart: boolean,
                action: ActionWithIntervalCallback,
                intervalChange: Time = new Time(0),
                onFinished?: ActionWithIntervalCallback)
    {
        this.isStarted = false;
        this.startedOn = new Date();
        this.Duration = duration;
        this.interval = interval;
        this.Action = action;
        this.IntervalChange = intervalChange;
        this.OnFinished = onFinished;

        if (autoStart) {
            this.Start();
        }
    }

    get Interval() {
        return this.interval;
    }

    get IsStarted() {
        return this.isStarted;
    }

    get StartedOn() {
        return this.startedOn;
    }

    private OnInterval() {
        if (!this.isStarted) return;

        this.Action(this);

        let diff = Time.FromMs(new Date().getTime() - this.startedOn!.getTime());

        if (diff.IsMoreOrEqualThan(this.Duration)) {
            this.isStarted = false;
            if (this.OnFinished) this.OnFinished(this);
        }
        else {
            this.interval = Time.FromMs(this.Interval.TotalMs.Plus(this.IntervalChange.TotalMs));
            this.StartInterval();
        }
    }

    private StartInterval() {
        setTimeout(() => this.OnInterval(), this.interval.TotalMs.AsNumber);
    }

    Start() {
        if (!this.isStarted) {
            this.startedOn = new Date();
            this.isStarted = true;
            this.StartInterval();
        }
        else {
            throw new Error(`ActionWithInterval is already started`);
        }
    }

    Stop() {
        if (this.isStarted) {
            this.isStarted = false;
        }
        else {
            throw new Error(`ActionWithInterval is already stopped`);
        }
    }
}