import {Wallet} from "../wallet";
import {GameObject, ClassNames} from "../gameObject";
import {Float, RawFloat} from "../../data";
import {ValueCalc} from "../../math";
import {Exclude, Type} from "class-transformer";
import {WalletValue} from "../wallet";
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
export class Price extends GameObject {
    @Type(() => Wallet)
    private wallet: Wallet;

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

    //todo сделать систему с умным вычислениям как в GameData
    //todo ввести возможность прописывать формулу для подсчёта цены, а не тупо по формуле прогрессий
    GetValueOnLevel(relativeLevel: RawFloat): Float {
        return this.calc.GetSum(this.Value, this.Step, relativeLevel);
        //console.log(`Type: ${this.ProgressionType}\nValue: ${this.Value}\nStep: ${this.Step}\nSum: ${sum}`);
    }

    GetNewPrice(count: RawFloat): Float {
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
}