import {GameObject, ClassNames} from "../gameObject";
import {Float, RawFloat} from "../../data";
import {Exclude, Type} from "class-transformer";
import { nerdEngine } from "../../nerdEngine";
import { GameEvent } from "../../components";

export class WalletStatistic {
    @Type(() => Float)
    TotalCollected: Float = new Float(0);
    @Type(() => Float)
    TotalSpent: Float = new Float(0);

    @Type(() => Float)
    BiggestValue: Float = new Float(0);
}

export class Wallet extends GameObject {

    @Exclude()
    public readonly Events = {
        OnChanged: new GameEvent<Wallet, { before: Float, after: Float, diff: Float }>()
    }

    @Type(() => Float)
    private value: Float;

    @Exclude()
    public readonly OnValueChanged?: (_valueBefore: Float, _valueAfter: Float, _diff: Float) => void;

    @Type(() => Float)
    private readonly baseValue: Float;

    @Type(() => WalletStatistic)
    public Statistics: WalletStatistic;

    constructor(engine: nerdEngine | null, id: string, value: RawFloat,
                OnValueChanged?: (_valueBefore: Float, _valueAfter: Float, _diff: Float) => void)
    {
        super(engine, ClassNames.Wallet, id);
        this.OnValueChanged = OnValueChanged;
        this.value = new Float(value);
        this.baseValue = this.value;

        this.Statistics = new WalletStatistic();
        this.Statistics.TotalCollected = this.value;
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
        });
    }

    Set(value: RawFloat) {
        this.Value = new Float(value);
    }

    Add(value: RawFloat) {
        const valueBefore = this.value;
        this.Set(Float.Plus(this.value, value));

        this.Statistics.TotalCollected = this.Statistics.TotalCollected.Plus(value);
        if (this.value.IsMore(this.Statistics.BiggestValue)) {
            this.Statistics.BiggestValue = this.value;
        }

        if (this.OnValueChanged) {
            this.OnValueChanged(valueBefore, this.value, this.value.Minus(valueBefore));
        }
    }

    Subtract(value: RawFloat) {
        const valueBefore = this.value;
        this.Set(Float.Minus(this.value, value));

        this.Statistics.TotalSpent = this.Statistics.TotalCollected.Plus(value);

        if (this.OnValueChanged) {
            this.OnValueChanged(valueBefore, this.value, this.value.Minus(valueBefore));
        }
    }

    public InitFrom(engine: nerdEngine, oldObject: Wallet): void {
        this.value = oldObject.Value;
        this.Statistics = oldObject.Statistics;
    }
}