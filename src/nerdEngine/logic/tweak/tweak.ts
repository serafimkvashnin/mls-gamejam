import {GameData} from "../../data";
import {ValueCalc} from "../../math";
import {Float, RawFloat} from "../../data";
import {Percent} from "../../tools";
import {Exclude, Type} from "class-transformer";
import { GameEvent, UniqueID } from "../../components";

//todo make separate class for TweakFunctions
export abstract class TweakFunction {
    public abstract readonly Priority: TweakPriority;

    abstract Get(value: RawFloat, tweakValue: RawFloat, _tweak: Tweak): Float;
}

export class TweakPlus extends TweakFunction {
    public readonly Priority: TweakPriority = TweakPriority.PlusOrMinus;

    Get(value: RawFloat, tweakValue: RawFloat, _tweak: Tweak): Float {
        return Float.Plus(value, tweakValue);
    }
}

export class TweakMinus extends TweakFunction {
    public readonly Priority: TweakPriority = TweakPriority.PlusOrMinus;

    Get(value: RawFloat, tweakValue: RawFloat, _tweak: Tweak): Float {
        return Float.Minus(value, tweakValue);
    }
}

export class TweakTimes extends TweakFunction {
    public readonly Priority: TweakPriority = TweakPriority.Multiply;

    Get(value: RawFloat, tweakValue: RawFloat, _tweak: Tweak): Float {
        return Float.Times(value, tweakValue);
    }
}

export class TweakDivide extends TweakFunction {
    public readonly Priority: TweakPriority = TweakPriority.Multiply;

    Get(value: RawFloat, tweakValue: RawFloat, _tweak: Tweak): Float {
        return Float.Divide(value, tweakValue);
    }
}

export class TweakPercent {
    public readonly Priority: TweakPriority = TweakPriority.Percent;

    Get(value: RawFloat, tweakValue: RawFloat, _tweak: Tweak): Float {
        return Percent.GetValueWithPercent(value, tweakValue);
    }
}

export enum TweakPriority {
    PlusOrMinus = 100,
    Multiply = 200,
    Percent = 300
}

export enum TweakValueType {
    Default,
    TimeInMs,
    Multiplier,
    Percent,
}

export class Tweak {
    public readonly Events = {
        LevelChanged: new GameEvent<Tweak, { level: Float }>(),
        //AnyGameDataValueChanged: new GameEvent<Tweak, { gameData: GameData }>()
    }

    @Exclude()
    public static UniqueID: UniqueID = new UniqueID("Tweak");

    @Exclude()
    public readonly UID: string;

    public readonly ClassID: string;
    public readonly ID: string;

    @Type(() => TweakFunction)
    public Function: TweakFunction;

    @Exclude()
    public readonly TargetList: GameData[];

    private active: boolean;

    @Type(() => Float)
    private value: Float;

    @Type(() => Float)
    private step: Float;

    @Type(() => ValueCalc)
    public readonly Calculator: ValueCalc;

    /**
     * Эта штука используется ТОЛЬКО для того чтобы определить внутри самого твика (в методе апгрейда),
     * был ли куплен твик. В другом коде это никак не используется. При получении информации об апгрейде
     * проверяется собственно уровень апгрейда.
     */
    private isBought: boolean;

    @Type(() => Float)
    private readonly baseValue: Float;

    @Type(() => Float)
    private readonly baseStep: Float;

    private readonly baseActive: boolean

    @Exclude()
    public readonly ValueType: TweakValueType;

    constructor(id: string, active: boolean, value: RawFloat, step: RawFloat, calc: ValueCalc,
                tweakFunction: TweakFunction, targetList: GameData | GameData[], valueType: TweakValueType = TweakValueType.Default)
    {
        this.ClassID = this.constructor.name;
        this.ID = id;
        this.active = active;
        this.value = new Float(value);
        this.step = new Float(step);
        this.Function = tweakFunction;
        this.TargetList = Array.isArray(targetList) ? targetList : [ targetList ];
        this.Calculator = calc;

        this.isBought = false;
        this.baseValue = this.value;
        this.baseStep = this.step;
        this.baseActive = this.active;

        this.UID = Tweak.UniqueID.GetNextID();

        this.ValueType = valueType;

        // this.TargetList.forEach(gameData => {
        //     GameEvent.RegisterMultiple([
        //         gameData.Events.OnRecomputed,
        //     ], (sender) => {
        //         this.Events.AnyGameDataValueChanged.Trigger(this, { gameData: sender });
        //     });
        // });
    }

    Reset() {
        this.value = this.baseValue;
        this.step = this.baseStep;
        this.isBought = false;
        this.active = this.baseActive;
    }

    get IsActive(): boolean {
        return this.active;
    }

    get Value(): Float {
        return this.value;
    }

    get Step(): Float {
        return this.step;
    }

    set Step(value: Float) {
        this.step = value;
    }

    set Value(value) {
        this.value = value;
    }

    static SortTweaks(tweaks: Tweak[]): Tweak[] {
        return tweaks.sort(this.CompareTweaks);
    }

    static CompareTweaks(tweak1: Tweak, tweak2: Tweak) {
        return tweak1.Function.Priority - tweak2.Function.Priority;
    }

    /**
     * @param relativeLevel For example, level = 2 returns next value
     * @constructor
     */
    GetValueOnLevel(relativeLevel: RawFloat) {
        return this.Calculator.GetElement(this.value, this.step, relativeLevel);
    }

    GetCopyWithValue(value: RawFloat): Tweak {
        return new Tweak(this.ID, this.active, value, this.step, this.Calculator, this.Function, this.TargetList);
    }

    Toggle(active: boolean) {
        this.active = active;
        // this.AddOrUpdateToGameData();
    }

    Upgrade(count: RawFloat) {
        count = new Float(count);
        if (!this.isBought) {
            if (count.IsEqual(1)) {
                this.isBought = true;
            }
            else {
                this.isBought = true;
                this.Upgrade(count.Minus(1));
            }
        }
        else {
            this.value = this.Calculator.GetElement(this.value, this.Step, count.Plus(1));
        }

        this.AddOrUpdateToGameData();
    }

    /**
     * @param level If level is less than 1, it will be set to 1
     */
    SetToLevel(level: RawFloat) {
        level = new Float(level);
        if (level.IsEqual(0)) {
            level = new Float(1);
        }

        this.value = this.Calculator.GetElement(this.baseValue, this.Step, level);
        this.AddOrUpdateToGameData();
        this.Events.LevelChanged.Trigger(this, { level });
    }

    AddOrUpdateToGameData() {
        for (const gameData of this.TargetList) {
            gameData.AddOrUpdateTweak(this, true);
        }
    }

    CalculateValue(value: RawFloat): Float {
        return this.Function.Get(value, this.value, this);
    }

    static IsEqualID(a: Tweak, b: Tweak) {
        return a.ID == b.ID;
    }

    static IsEqualUID(a: Tweak, b: Tweak) {
        return a.UID == b.UID;
    }
}





