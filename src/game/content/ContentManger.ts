import { PlayerContent } from "./PlayerContent";
import { nerdEngine } from "../../nerdEngine";
import { GameManager } from "../managers/GameManager";
import { WalletsContent } from "./WalletsContent";
import { EnemiesContent } from "./EnemiesContent";
import { WeaponsContent } from "./WeaponsContent";

export class ContentManger {
    public readonly player: PlayerContent;
    public readonly weapons: WeaponsContent;
    public readonly wallets: WalletsContent;
    public readonly enemies: EnemiesContent;

    constructor(public readonly gameManager: GameManager) {
        this.player = new PlayerContent(gameManager);
        this.weapons = new WeaponsContent(gameManager);
        this.wallets = new WalletsContent(gameManager);
        this.enemies = new EnemiesContent(gameManager)
    }
}