import Decimal from "break_infinity.s.js";
import {Type} from "class-transformer";
import {ClassNames, IGameObject} from "../logic/gameObject";
import {Time} from "./time";
import { nerdEngine } from "../nerdEngine";

export type RawFloat = Float | number | string;

export function AsNumber(value: RawFloat) {
    return RawFloatValue(value);
}

export function NewFloat(value: Float | number): Float {
    return new Float(value);
}

//move to class maybe?
export function RawFloatValue(value: RawFloat): number {
    switch (typeof value) {
        case "number": {
            return value as number;
        }
        case "string": {
            return new Float(value as string).AsNumber;
        }
        default: {
            return (value as Float).AsNumber;
        }
    }
}

//todo maybe do interface for number type
export class Float {

    @Type(() => Decimal)
    protected value: Decimal;

    protected readonly tolerance: number = 0.00001;

    constructor(value: RawFloat | Decimal | string = 0) {
        this.value = new Decimal(0);
        this.SetValue(value);
    }

    get AsDecimal() {
        return this.value;
    }

    SetValue(value: RawFloat | Decimal | string): void {
        if (value instanceof Float) {
            this.value = value.value;
        } else if (value instanceof Decimal) {
            this.value = value;
        } else {
            this.value = new Decimal(value);
        }
    }

    GetValue(): Float {
        return new Float(this.value);
    }

    // Constants
    static get MAX_VALUE_NUMBER(): Float {
        return new Float(Decimal.NUMBER_MAX_VALUE);
    }

    static get MIN_VALUE_NUMBER(): Float {
        return new Float(Decimal.NUMBER_MIN_VALUE);
    }

    static get MAX_VALUE(): Float {
        return new Float(Decimal.MAX_VALUE);
    }

    static get MIN_VALUE(): Float {
        return new Float(Decimal.MIN_VALUE);
    }

    // Static methods
    static Plus(value1: RawFloat, value2: RawFloat): Float {
        const value1d = new Float(value1).value;
        const value2d = new Float(value2).value;

        return new Float(Decimal.plus(value1d, value2d));
    }

    static Minus(value1: RawFloat, value2: RawFloat): Float {
        const value1d = new Float(value1).value;
        const value2d = new Float(value2).value;

        return new Float(Decimal.minus(value1d, value2d));
    }

    static Times(value1: RawFloat, value2: RawFloat): Float {
        const value1d = new Float(value1).value;
        const value2d = new Float(value2).value;

        return new Float(Decimal.times(value1d, value2d));
    }

    static Divide(value1: RawFloat, value2: RawFloat): Float {
        const value1d = new Float(value1).value;
        const value2d = new Float(value2).value;

        return new Float(Decimal.divide(value1d, value2d));
    }

    static Pow(value: RawFloat, exponent: RawFloat): Float {
        const valueD = new Float(value).value;
        const exponentD = new Float(exponent).value;

        return new Float(Decimal.pow(valueD, exponentD));
    }

    static Sqrt(value: RawFloat): Float {
        const valueD = new Float(value).value;

        return new Float(Decimal.sqrt(valueD));
    }

    static Abs(value: RawFloat): Float {
        const valueD = new Float(value).value;

        return new Float(Decimal.abs(valueD));
    }

    // Instance methods
    Plus(value: RawFloat): Float {
        return Float.Plus(this, value);
    }

    Minus(value: RawFloat): Float {
        return Float.Minus(this, value);
    }

    Times(value: RawFloat): Float {
        return Float.Times(this, value);
    }

    Divide(value: RawFloat): Float {
        return Float.Divide(this, value);
    }

    Pow(exponent: RawFloat): Float {
        return Float.Pow(this, exponent);
    }

    Sqrt(): Float {
        return Float.Sqrt(this);
    }

    Abs(): Float {
        return Float.Abs(this);
    }

    // Converting to number
    protected toNumber(): number {
        return this.value.toNumber();
    }

    ToNumber(): number {
        return this.toNumber();
    }

    get AsNumber(): number {
        return this.toNumber();
    }

    // System methods
    toString(): string {
        return this.value.string();
    }

    ToStringFixed(floats: number) {
        return this.value.toFixed(floats);
    }

    ToStringExtendedFixed(floats: number) {
        return this.value.toStringWithDecimalPlaces(floats);
    }

    // get String(): string {
    //     return this.AsString();
    // }

    static FromString(valueStr: string): Float {
        return new Float(parseFloat(valueStr));
    }

    FromString(valueStr: string): Float {
        return Float.FromString(valueStr);
    }

    SetFromString(valueStr: string): void {
        this.value = Float.FromString(valueStr).value;
    }

    // Logical operations
    // todo я пока заменю на сравнение с толерантностью все сравнения,
    //  но потом лучше сделать таки разные методы
    IsEqual(value: RawFloat): boolean {
        const valueD = new Float(value).value;
        return this.value.equals_tolerance(valueD, this.tolerance);
    }

    IsNotEqual(value: RawFloat) {
        return !this.IsEqual(value);
    }

    IsMore(value: RawFloat): boolean {
        const valueD = new Float(value).value;
        return this.value.greaterThan(valueD);
    }

    IsMoreOrEqual(value: RawFloat): boolean {
        const valueD = new Float(value).value;
        return this.value.gte_tolerance(valueD, this.tolerance);
    }

    IsLess(value: RawFloat): boolean {
        const valueD = new Float(value).value;
        return this.value.lessThan(valueD)
    }

    IsLessOrEqual(value: RawFloat): boolean {
        const valueD = new Float(value).value;
        return this.value.lte_tolerance(valueD, this.tolerance)
    }

    // Static Math replacements
    static ToFixed(value: RawFloat, floats: RawFloat): string {
        //return new Float(Float.FromString(FloatOrNumberValue(value).toFixed(FloatOrNumberValue(floats))));
        const valueD = new Float(value).value;
        const floatsN = RawFloatValue(floats);
        return valueD.toFixed(floatsN);
    }

    static Max(...values: RawFloat[]): Float {
        let maxValue = new Float(values[0]);
        for (let value of values) {
            value = new Float(value);
            if (value.IsMore(maxValue)) {
                maxValue = value;
            }
        }
        return maxValue;
    }

    static Min(...values: RawFloat[]): Float {
        let minValue = new Float(values[0]);
        for (let value of values) {
            value = new Float(value);
            if (value.IsLess(minValue)) {
                minValue = value;
            }
        }
        return minValue;
    }

    static Round(value: RawFloat): Float {
        const valueD = new Float(value).value;
        return new Float(valueD.round());
    }

    static Floor(value: RawFloat): Float {
        const valueD = new Float(value).value;
        return new Float(valueD.floor());
    }

    // Instance math replacements
    ToFixed(floats: number): string {
        return Float.ToFixed(this, floats);
    }

    Round(): Float {
        return Float.Round(this);
    }

    Floor(): Float {
        return Float.Floor(this);
    }
}

//todo нужен мне вообще этот класс?
export class GameFloat extends Float implements IGameObject {
    public readonly ClassID: ClassNames;
    public readonly ID: string;

    constructor(storage: nerdEngine | null, id: string, value: string | RawFloat) {
        super(value);
        this.ID = id;
        this.ClassID = ClassNames.GameFloat;

        if (storage) {
            storage.Storage.GameObjects.AddItem(this);
        }
    }

    //todo не должно быть так я думаю. надо сделать удобнее
    IsSameSignature<T extends IGameObject>(object: T): boolean {
        return `${this.ClassID}::${this.ID}` == `${object.ClassID}::${object.ID}`
    }

    InitUI() {}

    get Value(): Float {
        return this.GetValue();
    }

    set Value(value: Float) {
        this.SetValue(value);
    }

    Add(value: RawFloat): void {
        this.Value = this.Value.Plus(value);
    }

    Subtract(value: RawFloat): void {
        this.Value = this.Value.Minus(value);
    }

    Update(_dt: Time): void {

    }

    InitFrom(engine: nerdEngine, _oldItem: GameFloat): void {
        this.SetValue(_oldItem.GetValue());
    }
}