import {Float, RawFloat} from "./float";
import {Type} from "class-transformer";
import {UniqueID} from "../components";
import {IStorageItem} from "./objectStorage";

//todo implements ISerializable?
export class Time implements IStorageItem {

    public readonly ClassID: string;

    public static UniqueID: UniqueID = new UniqueID("Time");
    public readonly ID: string;

    @Type(() => Float)
    private milliseconds: Float;

    constructor(hours: RawFloat = 0, minutes: RawFloat = 0, seconds: RawFloat = 0, ms: RawFloat = 0) {
        this.ClassID = this.constructor.name;
        this.ID = Time.UniqueID.GetNextID();

        hours = new Float(hours);
        minutes = new Float(minutes);
        seconds = new Float(seconds);
        ms = new Float(ms);

        this.milliseconds = (hours.Times(3600).Times(1000)).Plus(minutes.Times(60).Times(1000)).Plus(seconds.Times(1000)).Plus(ms);
    }

    static FromConfig(c: {}) {
        //todo copy here the implementation from an-idle-phaser-game
    }

    static FromMs(ms: RawFloat): Time {
        return new Time(0, 0, 0, ms);
    }

    get TotalMs() {
        return this.milliseconds;
    }

    get TotalMilliseconds(): Float {
        return this.milliseconds;
    }

    get TotalSeconds(): Float {
        return this.milliseconds.Divide(1000);
    }

    get TotalMinutes(): Float {
        return this.TotalSeconds.Divide(60);
    }

    get TotalHours(): Float {
        return this.TotalMinutes.Divide(60);
    }

    get TotalDays(): Float {
        return this.TotalHours.Divide(24);
    }

    Add(time: Time) {
        this.milliseconds = this.milliseconds.Plus(time.TotalMilliseconds);
    }

    Subtract(time: Time) {
        this.milliseconds = this.milliseconds.Minus(time.TotalMilliseconds);
    }

    IsEqual(other: Time) {
        return this.TotalMs.IsEqual(other.TotalMs);
    }

    IsMoreOrEqualThan(other: Time) {
        return this.TotalMs.IsMoreOrEqual(other.TotalMs);
    }

    IsLessOrEqualThan(other: Time) {
        return this.TotalMs.IsLessOrEqual(other.TotalMs);
    }
}