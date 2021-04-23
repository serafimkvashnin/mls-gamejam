import {Tweak} from "../logic/tweak";
import {Float, RawFloat} from "./float";
import {Exclude, Type} from "class-transformer";
import {TweakArray} from "../logic/tweak";
import {IStorageItem} from "./objectStorage";
import { GameEvent } from "../components";

//todo be sure all important game data is saved, because i can someday need to use stats from it

export class GameDataStatistics {
    @Type(() => Float)
    SmallestValue: Float = new Float(0);

    @Type(() => Float)
    BiggestValue: Float = new Float(0);
}

export class GameData implements IStorageItem {
    public readonly Events = {
        OnRecomputed: new GameEvent<GameData, { prevValue: Float, newValue: Float }>(),
        OnBaseValueChanged: new GameEvent<GameData, { prevValue: Float, newValue: Float }>(),
    }

    public readonly ID: string;
    public readonly ClassID: string;

    @Exclude()
    public baseValue: Float;
    @Exclude()
    private computedValue: Float;

    @Exclude()
    public readonly TweakArray: TweakArray;
    @Exclude()
    public readonly MinMaxLimit?: [number | null, number | null];

    // Base
    @Exclude()
    private readonly firstBaseValue: Float;

    @Type(() => GameDataStatistics)
    public Statistics: GameDataStatistics;

    constructor(id: string, value: RawFloat, tweaks?: TweakArray | Tweak[],
                minMaxLimit?: [number | null, number | null])
    {
        this.ID = id;
        this.ClassID = this.constructor.name;
        this.baseValue = new Float(value);
        this.computedValue = this.baseValue;
        this.MinMaxLimit = minMaxLimit;

        if (tweaks) {
            this.TweakArray = tweaks instanceof TweakArray ? tweaks : new TweakArray(tweaks);
        }
        else {
            this.TweakArray = new TweakArray();
        }

        this.firstBaseValue = this.baseValue;

        this.Statistics = new GameDataStatistics();
        this.Statistics.SmallestValue = this.baseValue;
        this.Statistics.BiggestValue = this.baseValue;
    }

    Reset() {
        this.baseValue = this.firstBaseValue;
        this.recomputeValue();
    }

    get Value(): Float {
        return this.computedValue;
    }

    set BaseValue(newValue: Float) {
        const prevValue = this.baseValue;
        this.baseValue = new Float(newValue);
        this.Events.OnBaseValueChanged.Trigger(this, { prevValue, newValue });
        this.recomputeValue();
    }

    GetTweak(tweak: Tweak) {
        for (const item of this.TweakArray.Items) {
            if (item.ID == tweak.ID) {
                return item;
            }
        }

        throw new Error(`Tweak ${tweak} not found in GameData: ${this.ID}`);
    }

    HasTweakID(tweak: Tweak) {
        return this.TweakArray.HasTweak(tweak);
    }

    HasTweakUID(tweak: Tweak) {
        return this.TweakArray.HasTweakUID(tweak.UID);
    }

    private recomputeValue(): void {
        let newValue = this.GetValueWithTweaks(this.TweakArray.Items);
        newValue = this.FixValue(newValue);

        if (newValue.IsLess(this.Statistics.SmallestValue)) {
            this.Statistics.SmallestValue = newValue;
        }

        if (newValue.IsMore(this.Statistics.BiggestValue)) {
            this.Statistics.BiggestValue = newValue;
        }

        const prevValue = this.computedValue;
        this.computedValue = newValue;

        this.Events.OnRecomputed.Trigger(this, { prevValue, newValue });
    }

    private FixValue(value: Float): Float {
        let newValue = value;
        if (this.MinMaxLimit) {
            if (this.MinMaxLimit[0]) {
                newValue = Float.Max(this.MinMaxLimit[0], newValue);
            }

            if (this.MinMaxLimit[1]) {
                newValue = Float.Min(this.MinMaxLimit[1], newValue);
            }
        }

        return newValue;
    }

    GetValueWithoutTweaks(tweaksToExclude: Tweak[]): Float {
        let filteredTweaks: Tweak[] = [];
        for (const tweak of this.TweakArray.Items) {
            const excludedTweak = tweaksToExclude.find( (excludedTweak: Tweak) => tweak.ID == excludedTweak.ID);
            if (!excludedTweak) {
                filteredTweaks.push(tweak);
            }
        }
        filteredTweaks = Tweak.SortTweaks(filteredTweaks);
        return this.GetValueWithTweaks(filteredTweaks);
    }

    GetValueWithTweaks(tweaks: Tweak[], skipDisabledTweaks: boolean = true): Float {
        tweaks = Tweak.SortTweaks(tweaks);

        let value = this.baseValue;
        for (const tweak of tweaks) {
            if (skipDisabledTweaks ? tweak.IsActive : true) {
                value = tweak.CalculateValue(value);
            }
        }

        value = this.FixValue(value);
        return value;
    }

    UpdateTweak(tweak: Tweak) {
        //console.log(`Tweak value updated: ${this.GetTweak(tweakID).Value.String} -> ${new Float(value).String} [${this.GetTweak(tweakID).ID}]`)
        this.GetTweak(tweak).Value = tweak.Value;
        this.recomputeValue();
    }

    AddOrUpdateTweak(tweak: Tweak, update: boolean = true) {
        if (!this.HasTweakID(tweak)) {
            this.TweakArray.Items.push(tweak);
            this.TweakArray.SortTweaks();
            this.recomputeValue();
        }
        else {
            if (update && this.HasTweakUID(tweak)) {
                this.UpdateTweak(tweak);
            }
            else {
                throw new Error(`Tweak with id: ${tweak.ID} is already exists in GameData: ${this.ID}`);
            }
        }
    }

    RemoveTweak(id: string) {
        this.TweakArray.Remove(id);
    }
}