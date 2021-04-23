import {Wallet} from "./wallet";
import { Float, RawFloat } from "../../data";
import { Reward } from "./reward";
import { Type } from "class-transformer";

export class WalletValue {

    @Type(() => Float)
    private value: Float;

    constructor(public readonly Wallet: Wallet, value: RawFloat) {
        this.value = new Float(value);
    }

    get Value() {
        return this.value;
    }

    set Value(value) {
        this.value = value;
    }

    AddToWallet(setValueToZero = false) {
        this.Wallet.Add(this.Value);
        if (setValueToZero) {
            this.Value = new Float(0);
        }
    }

    static FromReward(reward: Reward) {
        return new WalletValue(reward.Wallet, reward.Value.AsNumber);
    }
}