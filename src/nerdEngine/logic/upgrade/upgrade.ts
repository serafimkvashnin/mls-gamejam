import {Price} from "../price";
import {PriceArray} from "../price";
import {ClassNames, GameObject} from "../gameObject";
import {TweakArray} from "../tweak";
import {Tweak} from "../tweak";
import {Float, RawFloat} from "../../data";
import {Exclude, Expose, Type} from "class-transformer";
import {UpgradeGUI} from "./upgradeGUI";
import {Setting} from "../setting";
import {Level} from "../../components";
import {WalletValueArray} from "../wallet";
import { nerdEngine } from "../../nerdEngine";

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
    buyCount?: Setting<any> | null,
    level?: Level,
    pricesArray: PriceArray,
    tweakArray: TweakArray,
    onBuyFunc?: UpgradeOnBought,
    isThemeUnlocked?: boolean,
    condition?: UpgradeCondition
}

export type UpgradeCondition = (upgrade: Upgrade, buyCount: Float) => boolean;

export type UpgradeOnBought = (upgrade: Upgrade, count: Float, spent: WalletValueArray) => void;

export class Upgrade extends GameObject {

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
    public IsThemeUnlocked: boolean

    @Exclude()
    public readonly Condition?: UpgradeCondition;

    @Exclude()
    protected autoAddUnlockCondition: boolean;

    //todo возможно, лучше стоит передавать customSetup, в которой можно будет подписаться на все нужные эвенты
    // а не просить передать отдельно все эти onTimer, onBuyFunc и т.д... я хз. ну либо подумать как сделать лучше

    constructor(engine: nerdEngine | null, id: string,
                buyCount: Setting<any> | null, level: Level,
                pricesArray: PriceArray, tweakArray: TweakArray,
                onBuyFunc?: UpgradeOnBought, isThemeUnlocked: boolean = false, condition?: UpgradeCondition)
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
        this.IsThemeUnlocked = isThemeUnlocked;
        this.Condition = condition;
        this.autoAddUnlockCondition = true;

        this.CheckNumbers();

        engine?.Events.OnContentStartedLoading.Register(() => {
            this.TweakArray.AddOrUpdateToGameData();
        });
    }

    static FromConfig(c: UpgradeConfig): Upgrade {
        return new Upgrade(c.engine, c.id, c.buyCount ?? null, c.level ?? new Level(0, null), c.pricesArray, c.tweakArray, c.onBuyFunc, c.isThemeUnlocked, c.condition);
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
                price.Calculator.Check(price.Step);
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
    }

    get Prices(): Price[] {
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
        count = this.CorrectBuyCount(count)

        let condition = this.Condition ? this.Condition(this, count) : true;

        return this.PriceArray.IsCanBuy(count) && condition;
    }

    //todo разделить на две функции. get GetMaxBuy() и вызывать просто Upgrade.Buy(this.MaxBuyCount)

    /**
     * @return Count of purchases
     */
    BuyMax(maxCount: RawFloat | undefined = undefined): Float {
        let bought = new Float(0);
        while ((maxCount ? bought < maxCount : true) && this.IsCanBuy(1)) {
            this.Buy(1);
            bought = Float.Plus(bought, 1);
        }

        return bought;
    }

    /**
     * @return Count of purchases
     */
    Buy(count?: RawFloat): Float {

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

            if (this.OnBuyEvent) {
                this.OnBuyEvent(this, count, spent);
            }
            return count;
        }
        else {
            console.log(`[WARNING!] Trying to buy count: ${count}, but can't actually buy (skip)!`);
            return new Float(0);
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
    }
}