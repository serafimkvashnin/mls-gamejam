import { ContentModule, nerdEngine, Reward } from "../../nerdEngine";
import { EnemyStats } from "./items/EnemyStats";
import { GameManager } from "../managers/GameManager";

export class EnemiesContent {

    private readonly enemies: ContentModule<{
        Egg: EnemyStats,
    }>

    constructor(public readonly game: GameManager) {
        this.enemies = new ContentModule(game.Engine, "Enemies", () => ({
            Egg: new EnemyStats({
                health: 5,
                speed: 5,
                reward: new Reward(game.Content.wallets.Gold, 0.1),
            }),
        }))
    }

    get Egg() {
        return this.enemies.Get().Egg;
    }
}