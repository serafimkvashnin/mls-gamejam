import {Float, RawFloat} from "./float";

export class Interval {

    public readonly Step: number;

    constructor(public Min: number, public Max: number, step: number = 1, checkValue: boolean = true) {
        this.Step = step;

        if (checkValue) {
            if (this.Min == this.Max) {
                throw new Error('Max is the same as Min');
            }

            if (this.Min > this.Max) {
                throw new Error('Max is smaller than Min');
            }
        }
    }

    IsValueIn(value: RawFloat, inclusive: boolean = true): boolean {
        value = new Float(value);

        if (inclusive) {
            return value.IsMoreOrEqual(this.Min) && value.IsLessOrEqual(this.Max);
        }
        else {
            return value.IsMore(this.Min) && value.IsLess(this.Max);
        }
    }
}