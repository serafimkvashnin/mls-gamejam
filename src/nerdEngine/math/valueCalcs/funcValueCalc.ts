///<reference path="../valueCalc.ts"/>
import {Float, RawFloat} from "../../data";
import {ValueCalc} from "../valueCalc";

export type PriceCalcFunc = (first: RawFloat, step: RawFloat, n: RawFloat) => Float;

export class FuncValueCalc extends ValueCalc {
    constructor(private elementFunc: PriceCalcFunc, private sumFunc: PriceCalcFunc) {
        super();
    }

    Check(step: RawFloat): void {
        // nothing?
    }

    GetElement(first: RawFloat, step: RawFloat, n: RawFloat): Float {
        return this.elementFunc(first, step, n);
    }

    GetNextElement(first: RawFloat, step: RawFloat): Float {
        return this.elementFunc(first, step, 2);
    }

    GetSum(first: RawFloat, step: RawFloat, n: RawFloat): Float {
        return this.sumFunc(first, step, n);
    }
}