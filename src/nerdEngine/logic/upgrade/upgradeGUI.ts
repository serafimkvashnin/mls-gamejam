import {Upgrade} from "./upgrade";
import {Wallet} from "../wallet";
import {Float, RawFloat} from "../../data";
import { IPrice, Price } from "../price";
import {Tweak} from "../tweak";

export class UpgradeGUI {
    constructor(private readonly upgrade: Upgrade) {}

    //todo move to PriceArray
    GetPrice(price: number | Wallet | Price): IPrice {
        if (typeof price == "number") {
            return this.upgrade.Prices[price as number];
        }
        else if (price instanceof Wallet) {
            return this.upgrade.PriceArray.GetByWallet(price as Wallet);
        }
        else {
            return price as Price;
        }
    }

    GetPriceValue(priceOrSearchMethod: number | Wallet | Price): Float {
        return this.GetPrice(priceOrSearchMethod).Value;
    }

    // relativeLevel means, 1 is just value, 2 is next value, and so on
    GetPriceValueOnLevel(priceOrSearchMethod: number | Wallet | Price, relativeLevel: RawFloat | null): Float {

        const price = this.GetPrice(priceOrSearchMethod);

        relativeLevel = relativeLevel ? new Float(relativeLevel) : new Float(this.upgrade.BuyCountInfo.Count);

        if (this.upgrade.Level.IsMaxed) {
            return price.Value;
        }
        else {
            relativeLevel = this.CorrectLevel(relativeLevel, "Price");
            return price.GetValueOnLevel(relativeLevel);
        }
    }

    CorrectLevel(value: Float, type: "Price" | "Tweak"): Float {
        if (this.upgrade.Level.ValueMax) {
            let currentLevels = this.upgrade.Level.Value;

            if (this.upgrade.Level.Value.IsEqual(0) || type == "Price") {
                currentLevels = this.upgrade.Level.Value;
            }
            else {
                currentLevels = this.upgrade.Level.Value.Minus(1);
            }

            let buyCount = Float.Min(value, this.upgrade.Level.ValueMax.Minus(currentLevels));

            if (!this.upgrade.Level.Value.IsEqual(0) && buyCount.IsMore(1)) {
                buyCount = Float.Max(2, buyCount);
            }

            return buyCount;
        }
        else {
            return value;
        }
    }

    //todo move to TweakArray
    GetTweak(tweakOrSearchMethod: number | Tweak): Tweak {
        if (typeof tweakOrSearchMethod == "number") {
            return this.upgrade.Tweaks[tweakOrSearchMethod as number];
        }
        else {
            return tweakOrSearchMethod as Tweak;
        }
    }

    GetTweakValue(tweakOrSearchMethod: number | Tweak, whatToReturnIfNotBought: Float = new Float(0)): Float {
        const tweak = this.GetTweak(tweakOrSearchMethod);

        if (this.upgrade.Level.Value.IsNotEqual(0)) {
            return tweak.Value;
        }
        else {
            return whatToReturnIfNotBought;
        }
    }

    GetTweakDataValue(tweakOrSearchMethod: number | Tweak, gameDataID: number): Float {
        const tweak = this.GetTweak(tweakOrSearchMethod);
        return tweak.TargetList[gameDataID].Value;
    }

    //todo there can be some refactoring
    GetTweakDataValueOnLevel(tweakOrSearchMethod: number | Tweak, gameDataID: number, relativeLevel: RawFloat | null): Float {
        const tweak = this.GetTweak(tweakOrSearchMethod)
        const gameData = tweak.TargetList[gameDataID];
        const valueBefore = gameData.Value;

        relativeLevel = relativeLevel ? new Float(relativeLevel) : new Float(this.upgrade.BuyCountInfo.Count);

        if (this.upgrade.Level.IsMaxed) {
            return valueBefore;
        }
        else {
            relativeLevel = this.upgrade.Level.Value.IsEqual(0)
                ? (relativeLevel.IsEqual(1)
                    ? new Float(1)
                    : relativeLevel.Plus(0))
                : relativeLevel.Plus(1);

            //todo universal function, to not duplicate this code
            if (this.upgrade.Level.ValueMax) {
                // relativeLevel = Float.Max(2, Float.Min(relativeLevel, this.upgrade.Level.ValueMax.Minus(this.upgrade.Level.Value)));
                relativeLevel = this.CorrectLevel(relativeLevel, "Tweak");
            }

            let tweaksAfterUpgrade = gameData.TweakArray.Items.slice(0);
            let countBefore = tweaksAfterUpgrade.length;
            for (let i = 0; i < tweaksAfterUpgrade.length; i++) {
                if (tweaksAfterUpgrade[i].ID == tweak.ID) {
                    tweaksAfterUpgrade.splice(i, 1);
                }
            }
            if (countBefore != tweaksAfterUpgrade.length + 1) {
                if (this.upgrade.Engine?.System.IsContentLoaded) {
                    throw new Error(`Tweaks wasn't filtered correctly. Count change: ${countBefore - tweaksAfterUpgrade.length}`);
                }
                // else {
                //     console.log(`[WARNING] Got "Tweaks wasn't filtered correctly", but content is not loaded (${this.upgrade.ID})`)
                // }
            }

            const valueOnLevel = tweak.GetValueOnLevel(relativeLevel);
            const tweakAfterUpgrade = tweak.GetCopyWithValue(valueOnLevel);
            tweakAfterUpgrade.Toggle(true);
            tweaksAfterUpgrade.push(tweakAfterUpgrade);

            return gameData.GetValueWithTweaks(tweaksAfterUpgrade);
        }
    }

    // relativeLevel means, 1 is just value, 2 is next value, and so on
    GetTweakValueOnLevel(tweakOrSearchMethod: number | Tweak, relativeLevel: RawFloat | null): Float {
        const tweak = this.GetTweak(tweakOrSearchMethod)

        relativeLevel = relativeLevel ? new Float(relativeLevel) : new Float(this.upgrade.BuyCountInfo.Count);

        if (this.upgrade.Level.IsMaxed) {
            return tweak.Value;
        }
        else {
            relativeLevel = this.upgrade.Level.Value.IsEqual(0)
                ? (relativeLevel.IsEqual(1)
                    ? new Float(1)
                    : relativeLevel.Plus(1))
                : relativeLevel.Plus(1);

            if (this.upgrade.Level.ValueMax) {
                // relativeLevel = Float.Max(2, Float.Min(relativeLevel, this.upgrade.Level.ValueMax.Minus(this.upgrade.Level.Value)));
                relativeLevel = this.CorrectLevel(relativeLevel, "Tweak");
            }
            return tweak.GetValueOnLevel(relativeLevel)
        }
    }
}

