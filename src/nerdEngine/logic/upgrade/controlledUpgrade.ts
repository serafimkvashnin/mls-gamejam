import { Exclude, Expose, plainToClass, Type } from "class-transformer";
import { Float, RawFloat } from "../../data";
import { nerdEngine } from "../../nerdEngine";
import { Upgrade, UpgradeClassID, UpgradeConfig } from "./upgrade";
import { Level } from "../../components";

export class ControlledUpgrade extends Upgrade {

    @Exclude()
    private maxLevel: Float;

    @Expose()
    @Type(() => Float)
    private selectedLevel: Float;

    constructor(c: UpgradeConfig) {
        super(c.engine, c.id, c.buyCount ?? null, c.level ?? new Level(0, null), c.pricesArray, c.tweakArray, c.onBuyFunc, c.isThemeUnlocked, c.condition);
        this.subClassID = UpgradeClassID.ControlledUpgrade;

        this.maxLevel = new Float(0);
        this.selectedLevel = new Float(0);
    }

    Buy(count?: RawFloat): Float {
        let boughtCount = super.Buy(count);
        this.maxLevel = this.maxLevel.Plus(boughtCount)
        this.SetToLevel(this.maxLevel);

        return boughtCount;
    }

    get SelectedLevel() {
        return this.selectedLevel;
    }

    get MaxSelectableLevel() {
        return this.maxLevel;
    }

    SetToLevel(value: RawFloat) {
        value = new Float(value);
        value = Float.Max(value, 0);
        value = Float.Min(value, this.MaxSelectableLevel);

        if (value.IsEqual(0)) {
            this.TweakArray.Toggle(false);
        }
        else {
            this.TweakArray.Toggle(true);
        }

        this.TweakArray.SetToLevel(value);
        this.Level.Value = value;

        // Note: We use this value to serialize selected level and then load it
        this.selectedLevel = value;
    }

    InitFrom(engine: nerdEngine, upgrade: ControlledUpgrade): void {
        super.InitFrom(engine, upgrade);

        let selectedLevel = plainToClass(Float, upgrade.selectedLevel);

        selectedLevel = Float.Min(selectedLevel, this.Level.Value);

        if (this.Level.ValueMax) {
            selectedLevel = Float.Min(selectedLevel, this.Level.ValueMax)
        }

        this.SetToLevel(selectedLevel);
    }
}