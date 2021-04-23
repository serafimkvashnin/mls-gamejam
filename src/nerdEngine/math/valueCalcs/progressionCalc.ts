///<reference path="../valueCalc.ts"/>
import {Float, RawFloat, RawFloatValue} from "../../data/float";
import {Progression, ProgType} from "../progression";
import {ValueCalc} from "../valueCalc";

export class ProgressionCalc extends ValueCalc {
    constructor(private type: ProgType) {
        super();
    }

    Check(step: RawFloat) {
        if (this.type == ProgType.Geometrical && RawFloatValue(step) == 1) {
            throw new Error("Geom. progression step is 1! Math won't work that way, cmon")
        }
    }

    GetElement(first: RawFloat, step: RawFloat, n: RawFloat): Float {
        return new Progression(this.type, first, step).GetElement(n);
    }

    GetNextElement(first: RawFloat, step: RawFloat): Float {
        return new Progression(this.type, first, step).GetElement(2);
    }

    GetSum(first: RawFloat, step: RawFloat, n: RawFloat): Float {
        return new Progression(this.type, first, step).GetSum(n);
    }
}