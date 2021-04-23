import { IPrice, Price, PriceArray } from "../price";
import { ClassNames, GameObject } from "../gameObject";
import { Tweak, TweakArray } from "../tweak";
import { Float, RawFloat } from "../../data";
import { Exclude, Expose, Type } from "class-transformer";
import { Setting } from "../setting";
import { GameEvent, Level } from "../../components";
import { Wallet, WalletValueArray } from "../wallet";
import { nerdEngine } from "../../nerdEngine";
import { LogColored } from "../../utils/utilsText";

export enum UpgradeClassID {
    Upgrade = "Upgrade",
    UnlockUpgrade = "UnlockUpgrade",
    ControlledUpgrade = "ControlledUpgrade",
}

export type BuyCountInfo = {
    Count: Float,
    IsBuyMax: boolean,
}

export type UpgradeConfig = {
    engine: nerdEngine | null,
    id: string,
    buyCount: Setting<any> | null,
    level: Level,
    pricesArray: PriceArray,
    tweakArray: TweakArray,
    onBuyFunc?: UpgradeOnBought,
    isThemeUnlocked?: boolean,
    condition?: UpgradeCondition,
    autoAddUnlockCondition?: boolean,
}

export type UpgradeBuyResult = { isBuyMax: boolean, count: Float, spent?: WalletValueArray };

export type UpgradeCondition = (upgrade: Upgrade, buyCount: Float) => boolean;

export type UpgradeOnBought = (upgrade: Upgrade, count: Float, spent: WalletValueArray) => void;

export class Upgrade extends GameObject {

    //todo note: вообще не уверен что это хорошая идея, но чисто по рофлу можно попробовать
    // public static StaticEvents = {
    //     OnAnyBought: new GameEvent<Upgrade, { result: UpgradeBuyResult }>()
    // }

    public readonly Events = {
        OnBought: new GameEvent<Upgrade, { result: UpgradeBuyResult }>(),
        OnUnlocked: new GameEvent<Upgrade, {}>(),
    }

    @Expose()
    protected subClassID: UpgradeClassID;

    @Expose()
    @Type(() => PriceArray)
    public readonly PriceArray: PriceArray;

    @Exclude()
    public readonly OnBuyEvent: UpgradeOnBought | undefined;

    @Exclude()
    public readonly TweakArray: TweakArray;

    @Exclude()
    public readonly BuyCount: Setting<any> | null;

    @Exclude()
    public readonly GUI: UpgradeGUI;

    @Expose()
    @Type(() => Level)
    public readonly Level: Level;

    @Exclude()
    public Theme: string;

    @Expose()
    private isThemeUnlocked: boolean

    @Exclude()
    public readonly Condition?: UpgradeCondition;

    @Exclude()
    protected autoAddUnlockCondition: boolean;

    //todo возможно, лучше стоит передавать customSetup, в которой можно будет подписаться на все нужные эвенты
    // а не просить передать отдельно все эти onTimer, onBuyFunc и т.д... я хз. ну либо подумать как сделать лучше

    constructor(engine: nerdEngine | null, id: string,
                buyCount: Setting<any> | null, level: Level,
                pricesArray: PriceArray, tweakArray: TweakArray,
                onBuyFunc?: UpgradeOnBought, isThemeUnlocked: boolean = false,
                condition?: UpgradeCondition, autoAddUnlockCondition: boolean = true)
    {
        super(engine, ClassNames.Upgrade, id);

        this.subClassID = UpgradeClassID.Upgrade;
        this.Level = level;
        this.PriceArray = pricesArray;

        // if (this.PriceArray) {
        //     this.PriceArray.Engine = engine ?? undefined;
        // }

        this.TweakArray = tweakArray;
        this.BuyCount = buyCount;
        this.OnBuyEvent = onBuyFunc;
        this.GUI = new UpgradeGUI(this);
        this.Theme = `Upgrade::${id}`;
        this.isThemeUnlocked = isThemeUnlocked;
        this.Condition = condition;
        this.autoAddUnlockCondition = autoAddUnlockCondition;

        this.CheckNumbers();

        engine?.Events.OnContentStartedLoading.Register(() => {
            this.TweakArray.AddOrUpdateToGameData();
        });
    }

    static FromConfig(c: UpgradeConfig): Upgrade {
        return new Upgrade(c.engine, c.id,
            c.buyCount,
            c.level,
            c.pricesArray,
            c.tweakArray,
            c.onBuyFunc,
            c.isThemeUnlocked,
            c.condition,
            c.autoAddUnlockCondition);
    }

    /**
     * I use this method internally to check numbers for math.
     * For example, if it has ProgressionCalc, with Geom progression, when step is '1', math will be broken
     * So i want to prevent it this way
     */
    private CheckNumbers() {
        if (this.PriceArray == undefined || this.TweakArray == undefined) {
            // it means that this method is called on serialization so just skip
            return;
        }

        try {
            for (const price of this.Prices) {
                if (Price.Is(price)) {
                    price.Calculator.Check(price.Step);
                }
            }

            for (const tweak of this.Tweaks) {
                tweak.Calculator.Check(tweak.Step);
            }
        }
        catch (e) {
            console.log(`[Upgrade.CheckNumbers] Bad numbers in upgrade: '${this.ID}'`);
            throw e;
        }
    }

    get IsThemeUnlocked() {
        return this.isThemeUnlocked;
    }

    set IsThemeUnlocked(value) {
        this.isThemeUnlocked = value;
        if (value) {
            this.Events.OnUnlocked.Trigger(this, {});
        }
    }

    get AutoAddUnlockCondition() {
        return this.autoAddUnlockCondition;
    }

    get SubClassID() {
        return this.subClassID;
    }

    Reset() {
        this.Level.Reset();
        this.PriceArray.Reset();
        this.TweakArray.Reset();
        //note: upgrade unlock
    }

    get Prices(): IPrice[] {
        return this.PriceArray.Prices;
    }

    get Tweaks(): Tweak[] {
        return this.TweakArray.Items;
    }

    CorrectBuyCount(count: RawFloat): Float {
        return Float.Min(this.Level.CanLevelUpCount, count);
    }

    //todo create BuyCount class!!! по идее можно как раз вынести всю эту логику рассчёта в класс BuyCount
    // и в него передевать цены? мб мб
    get BuyCountInfo(): BuyCountInfo {
        if (this.BuyCount) {
            if (this.BuyCount.Value != "Max") {
                return {
                    Count: new Float(this.BuyCount.Value),
                    IsBuyMax: false,
                }
            }
            else {
                return {
                    Count: new Float(1),
                    IsBuyMax: true,
                }
            }
        }
        else {
            return {
                Count: new Float(1),
                IsBuyMax: false,
            }
        }
    }

    //todo maybe return some type of FalseType, like "MaxLevel", or "NotEnoughWallet" and so on, for easier UI making
    IsCanBuy(count?: RawFloat): boolean {
        if (this.Level.IsMaxed) {
            return false;
        }

        count = count ? new Float(count) : this.BuyCountInfo.Count;
        //count = this.CorrectBuyCount(count)

        let condition = this.Condition ? this.Condition(this, count) : true;

        return this.PriceArray.IsCanBuy(count) && condition;
    }

    //todo разделить на две функции. get GetMaxBuy() и вызывать просто Upgrade.Buy(this.MaxBuyCount)

    /**
     * @return Count of purchases
     */
    // BuyMax(maxCount: RawFloat | undefined = undefined): Float {
    //     let bought = new Float(0);
    //
    //     while ((maxCount ? bought < maxCount : true) && this.IsCanBuy(1)) {
    //         this.Buy(1);
    //         bought = Float.Plus(bought, 1);
    //     }
    //
    //     return bought;
    // }

    BuyMax(maxCount: RawFloat | undefined = undefined): UpgradeBuyResult {
        let count = 0;

        while ((maxCount ? count < maxCount : true) && this.IsCanBuy(count + 1)) {
            //this.Buy(1);
            count++;
        }

        let result: undefined | UpgradeBuyResult;
        if (count > 0) {
            result = this.Buy(count);
            //console.log(`BuyMax: bought ${count} of ${this.ID}`)
        }
        else {
            //console.log(`BuyMax: can't buy any of ${this.ID}`)
        }

        return {
            count: new Float(count),
            spent: result ? result.spent : undefined,
            isBuyMax: true,
        }
    }

    /**
     * @return Count of purchases
     */
    Buy(count?: RawFloat, triggerEvent: boolean = true): UpgradeBuyResult {

        //todo maybe separate to different functions Buying, updating tweaks and so on.. Because function become too complicated
        // and hard to do ReInit

        if (count) {
            count = new Float(count);
            if (count.IsLessOrEqual(0)) {
                throw new Error(`Buy count was 0 or less when trying to buy`);
            }
        }
        else {
            let info = this.BuyCountInfo;
            count = info.Count;

            if (info.IsBuyMax) {
                return this.BuyMax();
            }
        }

        count = this.CorrectBuyCount(count);

        if (this.IsCanBuy(count)) {
            const spent: WalletValueArray = this.PriceArray.Buy(count);

            this.Level.Value = Float.Plus(this.Level.Value, count);
            this.TweakArray.Toggle(true);
            this.TweakArray.Upgrade(count);

            if (triggerEvent) {
                if (this.OnBuyEvent) this.OnBuyEvent(this, count, spent);

                this.Events.OnBought.Trigger(this, {
                    result: {
                        spent, count, isBuyMax: false,
                    }
                });
            }

            return {
                isBuyMax: false,
                count: count,
            }
        }
        else {
            LogColored(`[WARNING!] Trying to buy count: ${count}, but can't actually buy (skip)!`, '#ffad55');
            return {
                isBuyMax: false,
                count: new Float(0),
            }
        }
    }

    InitFrom(engine: nerdEngine, oldUpgrade: Upgrade): void {
        // Replacing spent values
        this.PriceArray.Wallets = oldUpgrade.PriceArray.SpentWallets;

        // Buying with old spent values
        this.BuyMax();

        // Because now, in prices, we have local copy of Price, instead of link to Content.Wallets,
        //  we updating links to the wallet and also adding local wallet value to global, to get buy change

        this.PriceArray.SetWalletsFromContent(engine, true, this.ID);

        //note: on older versions isThemeUnlocked is not saved, so i should handle this, to not set isThemeUnlocked to undefined
        if (typeof oldUpgrade.isThemeUnlocked != "undefined") {
            if (this.Engine) {
                this.Engine.Events.OnContentLoaded.Register(() => {
                    this.IsThemeUnlocked = oldUpgrade.isThemeUnlocked;
                });
            } else {
                this.IsThemeUnlocked = oldUpgrade.isThemeUnlocked;
            }
        }
    }
}

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