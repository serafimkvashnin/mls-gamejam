import { RawFloat, RawFloatValue } from "../../data";
import {Tweak} from "./tweak";
import { GameEvent } from "../../components";

export class DifficultyTweakArray {

    public readonly Events = {
        OnDifficultyChanged: new GameEvent<DifficultyTweakArray, { value: number }>(),
        OnToggled: new GameEvent<DifficultyTweakArray, { enabled: boolean }>(),
    }

    public Tweaks: DifficultyTweak[];
    constructor(tweaks: DifficultyTweak[] | DifficultyTweak) {
        this.Tweaks = Array.isArray(tweaks) ? tweaks : [ tweaks ];
    }

    Toggle(enabled: boolean) {
        this.Tweaks.forEach(item => item.Tweak.Toggle(enabled));
        this.Events.OnToggled.Trigger(this, { enabled });
    }

    AddOrUpdateToGameData() {
        this.Tweaks.forEach(item => item.Tweak.AddOrUpdateToGameData());
    }

    SetDifficulty(value: RawFloat) {
        this.Tweaks.forEach(item => item.SetDifficulty(value));

        this.Events.OnDifficultyChanged.Trigger(this, { value: RawFloatValue(value) })
    }
}

export class DifficultyTweak {

    public readonly Events = {
        OnDifficultyChanged: new GameEvent<DifficultyTweak, { before: number, value: number }>(),
    }

    private minLevel: number;
    private step: number;
    private maxLevel: number | null
    private readonly tweak: Tweak;

    private difficulty: number;
    private tweakLevel: number;

    /**
     * @param tweak
     * @param minLevel If min level is 10, and difficulty set to 15, tweaks will be set to level 5.
     * If min level is not reached, tweak is set to level 1
     * @param step If difficulty is 17 and step is 5, tweaks will have level 3 (floor(17/5) = 3)
     * @param maxLevel Max level from zero
     */
    constructor(tweak: Tweak, minLevel: number = 0, step: number = 1, maxLevel: number | null = null) {
        this.minLevel = minLevel;
        this.step = step;
        this.maxLevel = maxLevel;
        this.tweak = tweak;

        this.difficulty = 0;
        this.tweakLevel = 0;
    }

    get Difficulty(){
        return this.difficulty;
    }

    get Tweak() {
        return this.tweak;
    }

    SetDifficulty(value: RawFloat, disableWhenZero: boolean = false) {
        const before = this.difficulty;

        value = RawFloatValue(value);
        this.difficulty = value;

        if (this.difficulty == 0) {
            this.tweak.SetToLevel(1);

            if (disableWhenZero) this.tweak.Toggle(false);
        }
        else {
            let level = value;

            if (this.minLevel > level) return;
            else {
                level = level - this.minLevel
                if (this.maxLevel) {
                    //todo как мне отсчитывать макс левел? от минимального уровня или от нуля
                    level = Math.min(this.maxLevel, level);
                }
            }

            let steps = Math.floor(level / this.step);

            this.tweak.Toggle(true);
            this.tweak.SetToLevel(steps);
        }

        this.Events.OnDifficultyChanged.Trigger(this, { before, value: this.Difficulty })
    }
}