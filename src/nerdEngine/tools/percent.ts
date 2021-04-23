import {Float, RawFloat} from "../data";

export class Percent {
    public readonly classID: string;
    private percent: Float;

    constructor(percent: RawFloat) {
        this.classID = this.constructor.name;
        this.percent = new Float(percent);
    }

    get Percent(): Float {
        return this.percent;
    }

    set Percent(value: Float) {
        this.percent = value;
    }

    static GetValueWithPercent(value: RawFloat, percent: RawFloat) {
        percent = new Float(percent);
        value = new Float(value);

        if (percent.IsEqual(0)) {
            return new Float(value);
        }
        else {
            const multiplier = Float.Divide(percent, 100);
            return value.Plus(Float.Times(value, multiplier));
        }
    }

    static GetValuePercent(value: RawFloat, percent: RawFloat): Float {
        percent = new Float(percent);
        value = new Float(value);

        const multiplier = Float.Divide(percent, 100);
        return Float.Times(value, multiplier);
    }

    static GetValueWithoutPercent(value: RawFloat, percent: RawFloat): Float {
        percent = new Float(percent);
        value = new Float(value);

        if (percent.IsEqual(0)) {
            return value;
        }
        else {
            const multiplier = Float.Divide(percent, 100);
            return value.Minus(Float.Times(value, multiplier));
        }
    }

    GetValuePercent(value: RawFloat): Float {
        return Percent.GetValuePercent(value, this.percent);
    }

    GetValueWithPercent(value: RawFloat): Float {
        return Percent.GetValueWithPercent(value, this.percent,);
    }

    GetValueWithoutPercent(value: RawFloat): Float {
        return Percent.GetValueWithoutPercent(value, this.percent);
    }
}