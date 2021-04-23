import { Entity } from "../Entity";
import { MouseHelper } from "../../utils/MouseHelper";
import { WeaponConfig } from "./WeaponConfig";
import Transform = Phaser.GameObjects.Components.Transform;
import { Vector } from "matter";
import { AngleToVector2 } from "../../utils/MathHelper";
import { Scene } from "phaser";
import { Creature } from "../creatures/Creature";

export abstract class Weapon extends Entity {
    public config: WeaponConfig;

    protected owner: Creature;
    protected reloading: boolean = false;

    constructor(scene: Scene, config: WeaponConfig, owner: Creature) {
        super(scene, owner.x, owner.y, config.textureId);

        this.config = config;
        this.owner = owner;

        this.flipX = config.flipX;
    }

    public aimAt(target: Phaser.Math.Vector2 | Transform): void {
        this.depth = this.y;
        
        const angle = Phaser.Math.Angle.BetweenPoints(this.owner, target);
        const newPosition = AngleToVector2(angle, this.config.offset);

        this.setRotation(angle);
        this.setPosition(this.owner.x + newPosition.x, this.owner.y + newPosition.y);

        this.setFlipY(!(this.rotation > -Math.PI / 2 && this.rotation < Math.PI / 2));
    }

    public abstract attack(): void;
}