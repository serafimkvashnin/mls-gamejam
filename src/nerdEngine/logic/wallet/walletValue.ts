import {Wallet} from "./wallet";
import {Float} from "../../data";

export class WalletValue {
    constructor(public readonly Wallet: Wallet, public Value: Float) { }
}