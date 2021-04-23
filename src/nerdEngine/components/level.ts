import {Float, RawFloat} from "../data";
import {Type} from "class-transformer";
import {GameData} from "../data";

export class Level {

    @Type(() => Float)
    private value: Float

    @Type(() => GameData)
    private readonly valueMaxData: GameData | null;

    constructor(value: RawFloat, valueMax: RawFloat | null) {
        this.value = new Float(0);
        this.Value = new Float(value);

        if (valueMax) {
            this.valueMaxData = new GameData("MaxLevel", 0);
            this.ValueMax = new Float(valueMax as RawFloat);
        }
        else {
            this.valueMaxData = null;
        }
    }

    Reset() {
        this.value = new Float(0);
    }

    get IsMaxed(): boolean {
        return (this.valueMaxData ? this.value.IsEqual(this.valueMaxData.Value) : false);
    }

    get Value(): Float {
        return this.value;
    }

    set Value(newValue: Float) {
        if (this.valueMaxData ? newValue.IsLessOrEqual(this.valueMaxData.Value) : true) {
            this.value = newValue;
        }
        else {
            throw new Error(`Trying to set level (${newValue}) more than max level (${this.valueMaxData})`);
        }
    }

    get ValueMax(): Float | null {
        return (this.valueMaxData ? this.valueMaxData.Value : null);
    }

    set ValueMax(value: Float | null) {
        if (this.valueMaxData && value) {
            this.valueMaxData.BaseValue = value;
        }
        else {
            throw new Error("Trying to set max level data to value, but max level data or value is null");
        }
    }

    get CanLevelUpCount(): Float {
        if (this.ValueMax) {
            return Float.Minus(this.ValueMax, this.Value);
        }
        else {
            return Float.MAX_VALUE_NUMBER;
        }
    }

    get IsMoreThanZero(): boolean {
        return this.value.IsMore(0);
    }
}