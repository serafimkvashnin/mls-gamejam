import {Float, RawFloat} from "../data";

export abstract class ValueCalc {
    public readonly classID: string;
    protected constructor() {
        this.classID = this.constructor.name;
    }

    abstract Check(step: RawFloat): void;
    abstract GetElement(first: RawFloat, step: RawFloat, n: RawFloat): Float;
    abstract GetNextElement(first: RawFloat, step: RawFloat): Float;
    abstract GetSum(first: RawFloat, step: RawFloat, n: RawFloat): Float;
}