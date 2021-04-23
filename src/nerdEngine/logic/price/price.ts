import { Wallet, WalletValue } from "../wallet";
import { ClassNames, GameObject, IGameObject } from "../gameObject";
import { Float, RawFloat, Time } from "../../data";
import { ValueCalc } from "../../math";
import { Exclude, Type } from "class-transformer";
import { nerdEngine } from "../../nerdEngine";

/*todo сделать этапы для цены, например (отдельным саб-классом, наверное)
    {
        Value: 1,
        Step: 2,
        UntilLevel: 10
    },
    {
        Value: 10,
        Step: 2.5,
        UntilLevel: 20
    }
    ...
    И при покупке правильно разбивать покупку на части, чтобы во время обновлять значения этапов
*/

export interface IPrice extends IGameObject {
    Wallet: Wallet;
    readonly Spent: Float;
    Value: Float;
    Reset(): void;
    Buy(count: RawFloat): WalletValue;
    BuyProgressOne(): Float;
    IsCanBuy(count: RawFloat): boolean;
    GetValueOnLevel(relativeLevel: RawFloat): Float;
}

export class Price extends GameObject implements IPrice {
    @Type(() => Wallet)
    private wallet: Wallet;

    //todo а надо ли мне это сохранять? по моему нет (19.04.2021)
    private value: Float;
    private step: Float

    @Exclude()
    private readonly calc: ValueCalc;

    @Type(() => Float)
    private spent: Float;

    @Exclude()
    private readonly baseValue: Float;
    @Exclude()
    private readonly baseStep: Float;

    constructor(wallet: Wallet, value: RawFloat, step: RawFloat, calc: ValueCalc) {
        super(null, ClassNames.Price, '$price');
        this.wallet = wallet;
        this.value = new Float(value);
        this.step = new Float(step);
        this.calc = calc;
        this.spent = new Float(0);

        this.baseValue = this.value;
        this.baseStep = this.step;
    }

    Reset() {
        this.spent = new Float(0);
        this.value = this.baseValue;
        this.step = this.baseStep;
    }

    get Calculator(): ValueCalc {
        return this.calc;
    }

    get Wallet(): Wallet {
        return this.wallet;
    }

    set Wallet(wallet: Wallet) {
        this.wallet = wallet;
    }

    get Value(): Float {
        return this.value;
    }

    get Step(): Float {
        return this.step;
    }

    get Spent(): Float {
        return this.spent;
    }

    BuyProgress() {
        //todo buyProgress
        // BuyCount must be taken into account

    }

    //todo Percent data type?

    /**
     * @return 0-100
     */
    BuyProgressOne() {
        return Float.Min(100, (this.Wallet.Value.Divide(this.Value).Times(100)));
    }

    //todo сделать систему с умным вычислениям как в GameData
    //todo ввести возможность прописывать формулу для подсчёта цены, а не тупо по формуле прогрессий
    GetValueOnLevel(relativeLevel: RawFloat): Float {
        return this.calc.GetSum(this.Value, this.Step, relativeLevel);
        //console.log(`Type: ${this.ProgressionType}\nValue: ${this.Value}\nStep: ${this.Step}\nSum: ${sum}`);
    }

    private GetNewPrice(count: RawFloat): Float {
        count = new Float(count);
        return this.calc.GetElement(this.Value, this.Step, count.Plus(1));
    }

    IsCanBuy(count: RawFloat): boolean {
        count = new Float(count);
        if (this.Wallet) {
            const totalPrice = this.GetValueOnLevel(count);
            return this.Wallet.Value.IsMoreOrEqual(totalPrice);
        }
        else {
            throw Error(`Wallet ${this.Wallet} was not set!`);
        }
    }

    /**
     * @return {Float} Returns spent value
     * @function
     */
    Buy(count: RawFloat): WalletValue {
        count = new Float(count);
        if (count.IsLessOrEqual(0))  {
            throw new Error(`Buy count is ${count}`);
        }

        if (this.IsCanBuy(count)) {
            const totalPrice = this.GetValueOnLevel(count);

            this.value = this.GetNewPrice(count);
            this.Wallet.Subtract(totalPrice);
            this.spent = Float.Plus(this.spent, totalPrice);

            return new WalletValue(this.Wallet, totalPrice);
        }
        else {
            throw new Error(`Can't buy price with walletID: ${this.wallet.ID} Wanted to buy: ${count}`);
        }
    }

    public InitFrom(engine: nerdEngine, _oldPrice: Price): void {
        //skip, handled in Upgrade
    }

    public static Is(price: IGameObject): price is Price {
        return price.ClassID == ClassNames.Price;
    }
}

export class CustomPrice extends GameObject implements IPrice {
    @Type(() => Wallet)
    private wallet: Wallet;

    @Type(() => Float)
    private spent: Float;

    private prices: Float[];
    private currentPriceN: number = 0;

    @Exclude()
    private readonly basePrices: Float[];

    constructor(wallet: Wallet, prices: RawFloat[]) {
        super(null, ClassNames.CustomPrice, '$customPrice');
        this.wallet = wallet;
        this.spent = new Float(0);
        this.prices = prices.map(i => new Float(i));
        this.basePrices = this.prices.slice(0);
    }

    get Value(): Float {
        return this.prices[this.currentPriceN];
    }

    get Spent(): Float {
        return this.spent;
    }

    get Wallet(): Wallet {
        return this.wallet;
    }

    set Wallet(value) {
        this.wallet = value
    }

    get Prices(): Float[] {
        return this.prices;
    }

    //todo: мысль - ограничить доступ к функции Buy, чтобы ты мог её получить только получив true на IsCanBuy()
    /**
     * @return {Float} Returns spent value
     * @function
     */
    Buy(count: RawFloat): WalletValue {
        count = new Float(count);
        if (count.IsLessOrEqual(0))  {
            throw new Error(`Buy count is ${count}`);
        }

        if (this.IsCanBuy(count)) {
            const totalPrice = this.GetValueOnLevel(count);

            this.currentPriceN += count.Floor().AsNumber;
            this.Wallet.Subtract(totalPrice);
            this.spent = Float.Plus(this.spent, totalPrice);

            return new WalletValue(this.Wallet, totalPrice);
        }
        else {
            throw new Error(`Can't buy price with walletID: ${this.wallet.ID} Wanted to buy: ${count}`);
        }
    }

    BuyProgressOne() {
        return Float.Min(100, (this.Wallet.Value.Divide(this.Value).Times(100)));
    }

    GetValueOnLevel(relativeLevel: RawFloat): Float {
        relativeLevel = new Float(relativeLevel).Floor().AsNumber;
        relativeLevel = Math.min(relativeLevel + this.currentPriceN, this.Prices.length);

        let totalPrice = new Float(0);

        for (let i = this.currentPriceN; i < relativeLevel; i++) {
            totalPrice = totalPrice.Plus(this.prices[i]);
        }

        return totalPrice;
    }

    InitFrom<T extends IGameObject>(engine: nerdEngine, item: IGameObject | T): void {
        // nothing to init
    }

    get RemainingLevels(): number {
        return this.prices.length - this.currentPriceN;
    }

    IsCanBuy(count: RawFloat): boolean {
        count = new Float(count).Floor().AsNumber;
        count = count + this.currentPriceN;
        if (count > this.prices.length) return false;

        let totalPrice = new Float(0);

        for (let i = this.currentPriceN; i < count; i++) {
            totalPrice = totalPrice.Plus(this.prices[i]);
        }

        return this.Wallet.Value.IsMoreOrEqual(totalPrice);
    }

    Reset(): void {
        this.spent = new Float(0);
        this.currentPriceN = 0;
        this.prices = this.basePrices.slice(0);
    }
}