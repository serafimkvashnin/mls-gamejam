import { Entity } from "../Entity";
import { HealthComponent } from "../components/HealthComponent";
import Vector2 = Phaser.Math.Vector2;
import { Component } from "../components/Component";
import { GameScene } from "../../scenes/GameScene";
import { angleToVector2 } from "../../utils/helpers/MathHelper";
import { ClassConstructor, GameEvent } from "../../../nerdEngine";
import { ICreature } from "./ICreature";

export abstract class Creature extends Phaser.Physics.Arcade.Sprite implements ICreature {
    public readonly scene: GameScene;

    public events = {
        onPreDeath: new GameEvent<Creature, { from: Creature | Entity }>(),
        onDeath: new GameEvent<Creature, { from: Creature | Entity }>(),
    }

    public readonly health: HealthComponent;

    public readonly colliderRadius: number;

    private _components: Map<string, Component>;

    private _acceleration: Vector2;
    private _knockback: Vector2;

    // public confused!: boolean;

    private _tintFillDelayMs: number = 125;
    private _knockbackDragForce: number = 100;
    private _decelerationForce: number = 100;

    constructor(scene: GameScene, x: number, y: number, textureId: string, colliderRadius: number = 8) {
        super(scene, x, y, textureId);
        this.scene = scene;

        this.colliderRadius = colliderRadius;

        this._acceleration = new Vector2();
        this._knockback = new Vector2();

        this.events = {
            onPreDeath: new GameEvent(),
            onDeath: new GameEvent(),
        }
        
        this._components = new Map();

        this.health = this.addComponent(HealthComponent);
        this.health.events.onHealthEmpty.Register((from: any) => this.events.onPreDeath.Trigger(this, { from }));
        this.health.events.onHealthDecreased.Register((from: any) => {
            this.tintFill = true;
            setTimeout(() => { this.tintFill = false; }, this._tintFillDelayMs);
        });

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.scene.physics.world.enable(this);

        // TODO: wrong offset
        this.body.setCircle( this.colliderRadius,
            (-this.colliderRadius + 0.5 * this.width),
            (-this.colliderRadius + 0.5 * this.height));

        this.setDamping(true);
    }

    public preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        this._components.forEach(component => component.update(time, delta));

        this.setVelocity(
            this._acceleration.x + this._knockback.x * delta, 
            this._acceleration.y + this._knockback.y * delta
        );

        // Reduce knockback
        this._knockback.x -= this._knockback.x / this._knockbackDragForce * delta;
        this._knockback.y -= this._knockback.y / this._knockbackDragForce * delta;
        
        // Decelerate
        this._acceleration.x -= this._acceleration.x / this._decelerationForce * delta;
        this._acceleration.y -= this._acceleration.y / this._decelerationForce * delta;
    }

    /**
     * Add an instant force impulse to the body.
     */
    public addImpulse(from: Phaser.Types.Math.Vector2Like, force: number = 8): void {
        const angle = Phaser.Math.Angle.BetweenPoints(from, this);
        const velocity = angleToVector2(angle, force);
        this._knockback.x += velocity.x;
        this._knockback.y += velocity.y;
    }

    public accelerate(accelerationX: number, accelerationY: number, clamp: number): void {
        this._acceleration.x = Phaser.Math.Clamp((this._acceleration.x + accelerationX) * 1.0025, -clamp, clamp);
        this._acceleration.y = Phaser.Math.Clamp((this._acceleration.y + accelerationY) * 1.0025, -clamp, clamp);
    }

    /**
     * @param component Class of the component, that you want to add
     * @return It returns instance of created component
     */
    public addComponent<T extends Component>(component: ClassConstructor<T>): T {
        const instance = new component;
        this._components.set(instance.id, instance);

        instance.creature = this;

        return instance;
    }

    public removeComponent(type: string): void {
        this._components.delete(type);
    }

    public setKnockback(x: number, y: number): this {
        this._knockback.x = x;
        this._knockback.y = y;
        return this;
    }

    public getComponent<T extends Component>(component: ClassConstructor<T>): T | undefined {
        const instance = new component;
        return this._components.get(instance.id) as T;
    }

    public hasComponent<T extends Component>(type: ClassConstructor<T>): boolean {
        return this._components.has((new type).id);
    }

    //public disable

    /** @return Did animation actually changed or not */
    protected playAnimation(animation: string | Phaser.Animations.Animation): void {
        if (typeof animation != "string") animation = animation.key;

        this.play(animation, true);
    }

    protected changeTexture(texture: string | Phaser.Textures.Texture): boolean {
        if (typeof texture != "string") texture = texture.key;

        if (this.texture.key != texture) {
            this.setTexture(texture);
            return true;
        }
        else {
            return false;
        }
    }
}