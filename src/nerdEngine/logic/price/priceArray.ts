import { IPrice, Price } from "./price";
import {Float, RawFloat} from "../../data";
import {Type} from "class-transformer";
import {Wallet} from "../wallet";
import {WalletValueArray} from "../wallet";
import { nerdEngine } from "../../nerdEngine";

export class PriceArray {

    //public Engine: nerdEngine | undefined;
    public readonly classID: string;

    @Type(() => Price)
    private readonly prices: IPrice[];

    constructor(prices: IPrice | IPrice[]) {
        this.classID = this.constructor.name;
        this.prices = Array.isArray(prices) ? prices : [ prices ];
    }

    Reset() {
        for (const price of this.prices) {
            price.Reset();
        }
    }

    get Prices(): IPrice[] {
        return this.prices;
    }

    get Wallets(): Wallet[] {
        const wallets: Wallet[] = []
        for (const price of this.Prices) {
            wallets.push(price.Wallet);
        }

        return wallets;
    }

    set Wallets(wallets: Wallet[]) {
        for (let i = 0; i < this.Prices.length; i++){
            let price = this.Prices[i];
            price.Wallet = wallets[i];
        }
    }

    /**
     * @returns Wallets, initiated with Spent property of prices
     */
    get SpentWallets(): Wallet[] {
        const outputWallets = [];
        for (const price of this.Prices){
            outputWallets.push(new Wallet(null, price.Wallet.ID, price.Spent))
        }

        return outputWallets;
    }

    /**
     * @return 0-100
     */
    BuyProgressOne() {
        let max = new Float(0);
        for (const price of this.prices) {
            const value = price.BuyProgressOne();
            if (value.IsMore(max)) {
                max = value;
            }
        }

        return max;
    }

    GetByWallet(wallet: Wallet) {
        for (const price of this.prices) {
            if (price.Wallet.IsSameSignature(wallet)) {
                return price;
            }
        }
        throw new Error(`No price found by wallet: ${wallet.ID}`);
    }

    SetWalletsFromContent(engine: nerdEngine, addValueToWalletBeforeReplace: boolean, upgradeID: string) {
        for (const price of this.prices) {
            let localWalletValue = price.Wallet.Value;
            price.Wallet = engine.Storage.GameObjects.GetItem<Wallet>(price.Wallet.ID);

            if (addValueToWalletBeforeReplace) {
                if (localWalletValue.IsMore(0.1)) {
                    // if (this.Engine?.System.Settings.ShowRefundLogs) {
                    //     console.log(`[ReInitUpgrade::${upgradeID}] Refunded: ${GetNumberText(localWalletValue)} of ${price.Wallet.ID}`);
                    // }
                    price.Wallet.Add(localWalletValue);
                }
            }
        }
    }

    AddToWallets(wallets: Wallet[]): void {
        for (let i = 0; i < this.Prices.length; i++){
            let price = this.Prices[i];
            price.Wallet.Add(wallets[i].Value);
        }
    }

    IsCanBuy(count: RawFloat): boolean {
        count = new Float(count);
        for (const price of this.Prices) {
            if (!price.IsCanBuy(count)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return {Float} Returns total spent of all prices
     */
    Buy(count: RawFloat): WalletValueArray {
        count = new Float(count);
        let spentTotal = new WalletValueArray([]);

        for (const price of this.prices) {
            spentTotal.AddToArray(price.Buy(count));
        }

        return spentTotal;
    }

    Refund(engine: nerdEngine) {
        for (const price of this.prices) {
            if (engine.Storage.GameObjects.IsItemExists(price.Wallet.ID)) {
                engine.Storage.GameObjects.GetItem<Wallet>(price.Wallet.ID).Add(price.Spent);
                // if (price.Spent.IsMore(0)) {
                //     if (this.Engine?.System.Settings.ShowRefundLogs) {
                //         console.log(`[PriceArray.Refund] Refunded ${GetNumberText(price.Spent)} ${price.Wallet.ID}`);
                //     }
                // }
            }
            else {
                if (price.Spent.IsMore(0)) {
                    console.log(`[PriceArray.Refund] Wallet with id '${price.Wallet.ID}' is not exists anymore, so can't refund`);
                }
            }
        }
    }
}