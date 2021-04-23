import {GameData} from "../../data";
import {Type} from "class-transformer";
import {RawFloat} from "../../data";
import {Wallet} from "./wallet";

export class Reward {

    @Type(() => Wallet)
    public readonly Wallet: Wallet;

    @Type(() => GameData)
    public readonly ValueData: GameData;

    constructor(wallet: Wallet, value: RawFloat) {
        this.Wallet = wallet;
        this.ValueData = new GameData("Value", value);
    }

    get Value() {
        return this.ValueData.Value;
    }

    AddToWallet() {
        this.Wallet.Add(this.ValueData.Value);
    }
}