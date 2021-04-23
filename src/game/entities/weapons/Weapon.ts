import { Entity } from "../Entity";
import { WeaponConfig } from "./WeaponConfig";
import Transform = Phaser.GameObjects.Components.Transform;
import { Creature } from "../creatures/Creature";
import { GameScene } from "../../scenes/GameScene";
import { angleToVector2 } from "../../utils/helpers/MathHelper";

export abstract class Weapon extends Entity {
    public config: WeaponConfig;

    protected owner: Creature;
    protected reloading: boolean = false;

    public canAttack: boolean = true;

    constructor(scene: GameScene, config: WeaponConfig, owner: Creature) {
        super(scene, owner.x, owner.y, config.textureId);

        this.config = config;
        this.owner = owner;

        this.flipX = config.flipX;
    }

    public aimAt(target: Phaser.Math.Vector2 | Transform): void {
        this.depth = this.y;
        
        const angle = Phaser.Math.Angle.BetweenPoints(this.owner, target);
        const rotatedPosition = angleToVector2(angle, this.config.offset);

        const x = Phaser.Math.Linear(this.x, this.owner.x + rotatedPosition.x, 0.4);
        const y = Phaser.Math.Linear(this.y, this.owner.y + rotatedPosition.y, 0.4);

        this.setRotation(angle);
        this.setPosition(x, y);

        this.setFlipY(!(this.rotation > -Math.PI / 2 && this.rotation < Math.PI / 2));
    }

    public abstract attack(): void;
}