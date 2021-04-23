import {GameData} from "../data";
import {GameObject, ClassNames} from "./gameObject";
import {Float, RawFloat} from "../data";
import {Time} from "../data";
import {Exclude, Expose, Type} from "class-transformer";
import { nerdEngine } from "../nerdEngine";

export type OnTimerEvent = (timer: Timer) => void;

export class Timer extends GameObject {

    @Expose()
    private startOnCreate: boolean;

    @Expose()
    private repeat: boolean;

    @Exclude()
    public readonly OnTimerEvent?: OnTimerEvent;

    @Exclude()
    public readonly SpeedData: GameData;

    @Exclude()
    public readonly DurationMs: GameData;

    @Expose()
    @Type(() => Float)
    private progressInMS: Float;

    @Expose()
    private active: boolean;

    @Expose()
    private paused: boolean;

    @Exclude()
    private readonly saveProgress: boolean;
    @Exclude()
    private readonly baseStartOnCreate: boolean;
    @Exclude()
    private readonly baseRepeat: boolean;
    @Exclude()
    private readonly baseActive: boolean;

    constructor(engine: nerdEngine | null, id: string,
                duration: RawFloat | Time, speed: RawFloat, startOnCreate: boolean, repeat: boolean,
                onTimerEvent?: OnTimerEvent, saveProgress: boolean = true)
    {
        super(engine, ClassNames.Timer, id);
        if (duration instanceof Time) {
            this.DurationMs = new GameData('Duration', duration.TotalMilliseconds);
        }
        else {
            this.DurationMs = new GameData('Duration', duration);
        }
        this.SpeedData = new GameData('Speed', speed);
        this.startOnCreate = startOnCreate;
        this.repeat = repeat;
        this.OnTimerEvent = onTimerEvent;

        this.progressInMS = new Float(0); // progress in milliseconds //todo convert to time?
        this.active = false;
        this.paused = false;

        this.baseStartOnCreate = this.startOnCreate;
        this.baseRepeat = this.repeat;
        this.baseActive = this.active;

        this.saveProgress = saveProgress;

        if (this.startOnCreate) {
            this.Start();
        }

        if (engine) {
            engine.Storage.UpdateList.AddItem(this);
        }
    }

    ResetData() {
        this.Stop();
        this.active = this.baseActive;
        this.progressInMS = new Float(0);
        this.startOnCreate = this.baseStartOnCreate;
        this.repeat = this.baseRepeat;

        if (this.startOnCreate) {
            this.Start();
        }
    }

    get StartOnCreate(): boolean {
        return this.startOnCreate;
    }

    set StartOnCreate(value: boolean) {
        this.startOnCreate = value;
    }

    get Repeat(): boolean {
        return this.repeat;
    }

    set Repeat(value: boolean) {
        this.repeat = value;
    }

    get Duration(): Float {
        return this.DurationMs.Value;
    }

    /**
     * Duration of timer in milliseconds
     */
    set Duration(duration: Float) {
        this.DurationMs.BaseValue = duration;
    }

    get Speed(): Float {
        return this.SpeedData.Value;
    }

    set Speed(speed: Float) {
        this.SpeedData.BaseValue = speed;
    }

    get IsActive(): boolean {
        return this.active;
    }

    get IsPaused(): boolean {
        return this.paused;
    }

    get Elapsed(): Float {
        return this.progressInMS;
    }

    /**
     * Progress of timer in milliseconds
     */
    get Progress(): Float {
        let progress = this.progressInMS.Divide(this.Duration).Times(100);
        progress = Float.Max(progress, 0);
        progress = Float.Min(progress, 100);
        return progress;
    }

    get ElapsedTime(): Time  {
        return new Time(0, 0, 0, this.Elapsed);
    }

    get RemainedTime(): Time  {
        return new Time(0, 0, 0, Float.Minus(this.Duration, this.Elapsed));
    }

    get DurationTime(): Time {
        return new Time(0, 0, 0, this.progressInMS)
    }

    private StopAndReset() {
        this.progressInMS = new Float(0);
        this.active = false;
        this.paused = false;
    }

    Update(dt: Time) {
        super.Update(dt);
        if (this.active && !this.paused) {
            this.progressInMS = this.progressInMS.Plus(dt.TotalMilliseconds.Times(this.Speed));

            if (this.progressInMS.IsMore(this.DurationMs.Value)) {
                this.StopAndReset();

                if (this.OnTimerEvent) {
                    this.OnTimerEvent(this);
                }

                if (this.repeat) {
                    this.Start();
                }
            }
        }
    }

    private start() {
        this.StopAndReset();
        this.active = true;
    }

    Start(restart: boolean = false) {
        //console.log('Starting timer...');
        if (this.IsActive) {
            if (restart) {
                this.StopAndReset();
                this.start();
            }
            else {
                if (this.IsPaused) {
                    this.Unpause();
                }
            }
        }
        else {
            this.start();
        }
    }

    Stop(): boolean {
        //console.log('Stopping timer...');
        if (this.IsActive) {
            this.StopAndReset();
            return true;
        }
        else {
            return false;
        }
    }

    Toggle(enabled: boolean) {
        if (enabled) {
            this.Start();
        }
        else {
            this.Stop();
        }
    }

    Pause(): boolean {
        if (!this.IsPaused) {
            this.paused = true;
            return true;
        }
        else {
            return false;
        }
    }

    Unpause(): boolean {
        if (this.IsPaused) {
            this.paused = false;
            return true;
        }
        else {
            return false;
        }

        // maybe exception if else?
    }

    public InitFrom(engine: nerdEngine, oldTimer: Timer): void {
        this.paused = oldTimer.paused;
        this.startOnCreate = oldTimer.startOnCreate;
        this.repeat = oldTimer.repeat;

        if (oldTimer.IsActive && this.saveProgress) {
            this.Start();
            this.progressInMS = oldTimer.progressInMS;
        }
    }
}