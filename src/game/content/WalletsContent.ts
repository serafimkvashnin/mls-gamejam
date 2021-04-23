import { ContentModule } from "../../nerdEngine/content";
import { Wallet } from "../../nerdEngine/logic/wallet";
import { GameData, nerdEngine } from "../../nerdEngine";
import { GameManager } from "../managers/GameManager";

export class WalletsContent {

    private readonly wallets: ContentModule<{
        Diamonds: Wallet,
        Gold: Wallet,
    }>

    constructor(public readonly GameManager: GameManager) {
        this.wallets = new ContentModule(GameManager.Engine, "Wallets", () => ({
            Diamonds: new Wallet(GameManager.Engine, "Diamonds", 0),
            Gold: new Wallet(GameManager.Engine, "Gold", 0),
        }));
    }

    get Gold() {
        return this.wallets.Get().Gold;
    }
}