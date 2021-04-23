import { EntityGroup } from "../../EntityGroup";
import { Enemy } from "./Enemy";
import { CreatureGroup } from "../CreatureGroup";
import { GameScene } from "../../../scenes/GameScene";
import { TextureId } from "../../../registry/enums/TextureId";

export class EnemyGroup extends CreatureGroup {
    constructor(scene: GameScene, entityGroup: EntityGroup, quantity: number = 10) {
        super(scene);

        this.createCallback = item => {
            entityGroup.add(item);
            this.createEnemy(item as Enemy);
            this.scene.physics.world.disable(item);
        }

        this.createMultiple({
            classType: Enemy,
            quantity: quantity,
            active: false,
            visible: false,
            key: TextureId.SimpleZombieRunning
        });
    }

    public killAndHide(enemy: Enemy): void {
        super.killAndHide(enemy);
        enemy.body.stop();
        this.scene.physics.world.disable(enemy);
    }

    /** @returns an enemy of a certain type ready for use. */
    public getEnemy<T extends Enemy>(x: number, y: number): T {
        const enemy = <T> this.getFirstDead(true);
        enemy.setVisible(true);
        enemy.setActive(true);
        this.scene.physics.world.enable(enemy);
        return enemy;
    }

    protected createEnemy(enemy: Enemy): Enemy {
        enemy.events.onDeath.Register((enemy) => { 
            this.onAnyoneDeath.Trigger(enemy, {from: enemy});
            this.killAndHide(enemy as Enemy);
        });
        return enemy;
    }
}