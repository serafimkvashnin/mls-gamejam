import { GameData, RawFloat } from "../../../nerdEngine/data";
import { Reward } from "../../../nerdEngine/logic/wallet";

export type EnemyConfig = {
    health: RawFloat,
    speed: RawFloat,
    reward: Reward,
}

export class EnemyStats {

    public readonly health: GameData;
    public readonly speed: GameData;
    public readonly reward: Reward;

    constructor(c: EnemyConfig) {
        this.health = new GameData("Health", c.health);
        this.speed = new GameData("Speed", c.speed);
        this.reward = c.reward;
    }
}