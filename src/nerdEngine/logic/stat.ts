import {GameData} from "../data";
import {GameObject, ClassNames} from "./gameObject";
import {Float, RawFloat} from "../data";
import { Exclude, Type } from "class-transformer";
import {GameEvent} from "../components";
import { nerdEngine } from "../nerdEngine";

type OnMaxValueExceeded = (diff: RawFloat) => void;

export class Stat extends GameObject{

    @Exclude()
    public readonly Events = {
        OnChanged: new GameEvent<Stat, { before: Float, after: Float, diff: Float }>()
    }

    @Type(() => Float)
    private value: Float;

    @Type(() => GameData)
    public readonly MaxValueData: GameData | undefined;

    private readonly onMaxValueExceeded: OnMaxValueExceeded | undefined;



    @Type(() => Float)
    private readonly baseValue: Float;

    constructor(engine: nerdEngine | null, id: string,
                value: RawFloat, maxValue?: RawFloat,
                onMaxValueExceeded?: OnMaxValueExceeded)
    {
        super(engine, ClassNames.Stat, id);

        this.value = new Float(value);
        this.baseValue = this.value;

        if (maxValue && onMaxValueExceeded) {
            this.MaxValueData = new GameData('MaxValue', maxValue);
            this.onMaxValueExceeded = onMaxValueExceeded;
        }
    }

    Reset() {
        this.value = this.baseValue;
    }

    get Value(): Float {
        return this.value;
    }

    set Value(value: Float) {
        const before = this.value;
        this.value = value;
        const after = this.value;

        this.Events.OnChanged.Trigger(this, {
            before,
            after,
            diff: after.Minus(before)
        })

        this.CheckValue(value);
    }

    Add(value: RawFloat) {
        this.Value = Float.Plus(this.value, value);
    }

    Subtract(value: RawFloat) {
        this.Value = Float.Minus(this.value, value);
    }

    get MaxValue(): Float | null {
        return (this.HasMaxValue() ? this.MaxValueData!.Value : null);
    }

    HasMaxValue(): boolean {
        return (this.MaxValueData != undefined && this.onMaxValueExceeded != undefined);
    }

    CheckValue(value: RawFloat) {
        value = new Float(value);
        const diff = Float.Minus(value, this.Value);
        if (this.onMaxValueExceeded) {
            if (value.IsMore(this.MaxValue!)) {
                this.onMaxValueExceeded(diff);
            }
        }
    }

    public InitFrom(engine: nerdEngine, oldStat: Stat): void {
        this.Value = oldStat.Value;
    }
}