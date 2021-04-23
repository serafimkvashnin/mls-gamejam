import { Exclude, Type } from "class-transformer";
import { nerdEngine } from "../../nerdEngine";
import { PriceArray } from "../price";
import { Level } from "../../components";
import { TweakArray } from "../tweak";
import { Upgrade, UpgradeClassID } from "./upgrade";
import { Unlock } from "../unlock";

export class UnlockUpgrade extends Upgrade  {

    @Exclude()
    @Type(() => Unlock)
    public readonly Unlock: Unlock;

    constructor(engine: nerdEngine | null, id: string,
                unlock: Unlock, priceArray: PriceArray, isThemeUnlocked: boolean = false)
    {
        super(engine, id, null, new Level(0, 1),
            priceArray, new TweakArray([]), () => unlock.Toggle(true),
            isThemeUnlocked);

        this.subClassID = UpgradeClassID.UnlockUpgrade;

        this.autoAddUnlockCondition = false;
        this.Theme = unlock.ID;
        this.Unlock = unlock;
    }

    Reset() {
        super.Reset();
        this.Unlock.Reset();
    }

    InitFrom(engine: nerdEngine, oldUpgrade: UnlockUpgrade): void {
        super.InitFrom(engine, oldUpgrade);

        if (this.Level.Value.IsEqual(0) && oldUpgrade.Level.Value.IsNotEqual(0)) {
            console.log(`[UnlockUpgrade] Old upgrade was bought, but current is not, so resetting unlock`);
            this.Unlock.Toggle(false);
        }
    }
}