import { Entity } from "../Entity";
import { ProjectileConfig } from "./ProjectileConfig";
import { GameEvent } from "../../../nerdEngine/components";
import { TextureId } from "../../managers/registers/ResourceRegister";
import { Creature } from "../creatures/Creature";
import { Scene } from "phaser";

export abstract class Projectile extends Entity {
    public readonly onDeath: GameEvent<Projectile, { from: Creature | Entity }>;

    public config!: ProjectileConfig;

    private elapsedTime: number = 0;

    constructor (scene: Scene, x: number, y: number, TextureId: TextureId) {
        super(scene, x, y, TextureId);

        this.onDeath = new GameEvent();

        this.scene.physics.add.existing(this);
        
        this.body.setSize(this.height, this.height);
    }

    public init(x: number, y: number, config: ProjectileConfig): void {
        this.setPosition(x, y);
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