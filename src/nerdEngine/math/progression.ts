import {Float, RawFloat, NewFloat} from "../data";

export enum ProgType {
    Arithmetic = 'Arithmetic',
    Geometrical = 'Geometrical',
}

export class Progression {
    public readonly classID: string;
    private readonly progressionType: ProgType;
    private readonly first: Float;
    private readonly step: Float;
    constructor(progressionType: ProgType, first: RawFloat, step: RawFloat) {
        this.classID = this.constructor.name;
        this.progressionType = progressionType;
        this.first = new Float(first);
        this.step = new Float(step);
    }

    get Type(): ProgType {
        return this.progressionType;
    }

    get First(): Float {
        return this.first;
    }

    get Step(): Float {
        return this.step;
    }

    GetElement(n: RawFloat) {
        n = new Float(n);
        if (this.progressionType == ProgType.Arithmetic) {
            return this.first.Plus((this.step).Times(n.Minus(1)));
        }
        else if (this.progressionType == ProgType.Geometrical) {
            return this.first.Times((this.step).Pow(n.Minus(1)));
        }
        else {
            throw new Error(`Error, progression type is not correct`);
        }
    }

    GetSum(n: RawFloat) {
        n = new Float(n);
        if (this.progressionType == ProgType.Arithmetic) {
            return ((NewFloat(2).Times(this.first).Plus(this.step.Times(n.Minus(1)))).Divide(2)).Times(n);
        }
        else if (this.progressionType == ProgType.Geometrical) {
            return (this.first.Times(this.step.Pow(n).Minus(1))).Divide(this.step.Minus(1));
        }
        else {
            throw new Error(`Error, progression type is not correct`);
        }
    }

    GetSumInterval(start: RawFloat, end: RawFloat) {
        start = new Float(start);
        end = new Float(end);
        if (this.progressionType == ProgType.Arithmetic) {
            start = start.Minus(1);
            const s1 = ((NewFloat(2).Times(this.first).Plus(this.step.Times(start.Minus(1)))).Divide(2)).Times(start);
            const s2 = ((NewFloat(2).Times(this.first).Plus(this.step.Times(end.Minus(1)))).Divide(2)).Times(end);
            return s2.Minus(s1);
        }
        else if (this.progressionType == ProgType.Geometrical) {
            start = start.Minus(1);
            const s1 = this.first.Times(this.step.Pow(start).Minus(1)).Divide(this.step.Minus(1));
            const s2 = this.first.Times(this.step.Pow(end).Minus(1)).Divide(this.step.Minus(1));
            return s2.Minus(s1);
        }
        else {
            throw new Error(`Error, progression type is not correct`);
        }
    }
}