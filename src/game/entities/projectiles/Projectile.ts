import { Entity } from "../Entity";
import { ProjectileConfig } from "./ProjectileConfig";
import { GameEvent } from "../../../nerdEngine/components";
import { Creature } from "../creatures/Creature";
import { GameScene } from "../../scenes/GameScene";
import { TextureId } from "../../registry/enums/TextureId";
import { LayerId } from "../../registry/enums/LayerId";

export abstract class Projectile extends Entity {
    public readonly onDeath: GameEvent<Projectile, { from: Creature | Entity }>;

    public config!: ProjectileConfig;

    private elapsedTime: number = 0;

    constructor (scene: GameScene, x: number, y: number, textureId: TextureId) {
        super(scene, x, y, textureId);

        this.onDeath = new GameEvent();

        // console.log(this.height); for first 10 proj returns 12 than 32
        this.scene.physics.add.existing(this).setSize(this.height, this.height);
        
        this.depth = LayerId.Projectiles;
    }

    public reset(x: number, y: number, rotation: number, config: ProjectileConfig): void {
        this.setPosition(x, y);
        this.setRotation(rotation);
        
        this.config = config;

        this.elapsedTime = 0;
    }

    public preUpdate(time: number, delta: number) {
        this.config.behavior(this, delta);
        this.updateLifeTime(delta);
    }

    private updateLifeTime(delta: number): void {
        this.elapsedTime += delta;

        if (this.elapsedTime >= this.config.lifetime) {
            this.onDeath.Trigger(this, { from: this });
            this.elapsedTime = 0;
        }
    }
}