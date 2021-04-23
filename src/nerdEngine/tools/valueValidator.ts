import { Clamp } from "../utils/utilsMath";
import { Interval } from "../data";

export interface ValueValidator<T> {
    CorrectValue(value: T): T;
    IsValueCorrect(value: T): boolean;
}

export class ArrayValidator<T> implements ValueValidator<T> {
    constructor(public readonly Values: any[]) {}

    CorrectValue(value: T): T {
        if (this.Values.includes(value)) {
            return value;
        }
        else {
            throw new Error(`Value ${value} is not correct`);
        }
    }

    IsValueCorrect(value: any) {
        return this.Values.includes(value);
    }
}

export type PrimitiveType = string | boolean | number
export type PrimitiveTypeNames = "string" | "number" | "boolean"

//todo option to enable auto converting type
export class TypeValidator<T extends PrimitiveType> implements ValueValidator<T> {
    constructor(public readonly Type: PrimitiveTypeNames) {}

    CorrectValue(value: T): T {
        let correctValue: PrimitiveType = TypeValidator.ConvertToType<T>(value, this.Type);

        if (typeof correctValue == this.Type) {
            return correctValue as T;
        }
        else {
            throw new Error(`Value ${correctValue} is not correct`);
        }
    }

    IsValueCorrect(value: any) {
        try {
            return typeof TypeValidator.ConvertToType<T>(value, this.Type) == this.Type;
        }
        catch (e) {
            return false;
        }
    }

    static ConvertToType<U extends PrimitiveType>(value: PrimitiveType, type: PrimitiveTypeNames): U  {
        let correctValue: PrimitiveType;
        switch (type) {
            case "boolean": correctValue = Boolean(value).valueOf(); break;
            case "string": correctValue = String(value).valueOf(); break;
            case "number": correctValue = Number(value).valueOf(); break;
        }
        return correctValue as U;
    }
}

export class IntervalValidator implements ValueValidator<number> {
    constructor(public readonly Interval: Interval,
                public readonly Inclusive: boolean = true,
                public readonly Normalize: boolean = true)
    {

    }

    CorrectValue(value: number): number {
        if (this.Interval.IsValueIn(value, this.Inclusive)) {
            return value;
        }
        else {
            if (this.Normalize) {
                return Clamp(value, this.Interval);
            }
            else {
                throw new Error(`Value ${value} is not correct`);
            }
        }
    }

    IsValueCorrect(value: any) {
        return this.Interval.IsValueIn(value, this.Inclusive);
    }
}