import {Wallet} from "./wallet";
import {Float} from "../../data";
import {WalletValue} from "./walletValue";

export class WalletValueArray {
    constructor(public readonly WalletValues: WalletValue[]) { }

    HasWallet(wallet: Wallet): boolean {
        for (const item of this.WalletValues) {
            if (item.Wallet.IsSameSignature(wallet)) {
                return true;
            }
        }
        return false;
    }

    GetByWallet(wallet: Wallet) {
        for (const item of this.WalletValues) {
            if (item.Wallet.IsSameSignature(wallet)) {
                return item;
            }
        }

        throw new Error(`WalletValue with wallet '${wallet.ID}' was not found`);
    }

    AddToArray(walletValue: WalletValue) {
        if (this.HasWallet(walletValue.Wallet)) {
            this.GetByWallet(walletValue.Wallet).Value = Float.Plus(this.GetByWallet(walletValue.Wallet).Value, walletValue.Value);
        }
        else {
            this.WalletValues.push(walletValue);
        }
    }

    Subtract(walletValue: WalletValue) {
        this.GetByWallet(walletValue.Wallet).Value = Float.Minus(this.GetByWallet(walletValue.Wallet).Value, walletValue.Value);
    }

    AddToWallets(setValuesToZero = false) {
        for (const value of this.WalletValues) {
            value.Wallet.Add(value.Value);
            if (setValuesToZero) {
                value.Value = new Float(0);
            }
        }
    }
}