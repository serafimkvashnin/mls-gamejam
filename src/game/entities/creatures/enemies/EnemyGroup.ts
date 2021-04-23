import { EntityGroup } from "../../EntityGroup";
import { Creature } from "../Creature";
import { Enemy } from "./Enemy";
import { CreatureGroup } from "../CreatureGroup";
import { GameScene } from "../../../scenes/game/GameScene";

export class EnemyGroup extends CreatureGroup {
    constructor(scene: GameScene, entityGroup: EntityGroup) {
        super(scene);

        this.createCallback = item => {
            entityGroup.add(item);
            (item as Enemy).onDeath.Register((from: Creature) => this.onAnyoneDeath.Trigger(from, {from: from}));
        }
    }
}