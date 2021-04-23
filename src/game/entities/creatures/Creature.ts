import { Entity } from "../Entity";
import { HealthComponent } from "../components/HealthComponent";
import { GameEvent } from "../../../nerdEngine/components";
import { Component } from "../components/Component";
import Scene = Phaser.Scene;
import { ClassConstructor } from "../../../nerdEngine/data";
import { AngleToVector2 } from "../../utils/MathHelper";


export abstract class Creature extends Phaser.Physics.Arcade.Sprite {
    public readonly onDeath: GameEvent<Creature, { from: Creature | Entity }>;

    private components: Map<string, Component>;

    public readonly radius: number;

    constructor(scene: Scene, x: number, y: number, textureId: string) {
        super(scene, x, y, textureId);
        
        this.onDeath = new GameEvent();
        
        this.radius = this.width / 2.5;

        this.components = new Map();

        const health = this.addComponent(HealthComponent);
        health.events.onHealthEmpty.Register((from: any) => this.onDeath.Trigger(this, { from }));

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        // TODO: wrong offset
        this.body.setCircle( this.radius,
            (-this.radius + 0.5 * this.width),
            (-this.radius + 0.5 * this.height));
    }

    public preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        this.update(time, delta);
        this.components.forEach(component => component.update(time, delta));
    }

    /**
     * Add an instant force impulse to the body.
     * Make sure that movement of the body is controlled by `setAcceleration()` function.
     */
    public addImpulse(from: Phaser.Types.Math.Vector2Like, force: number): void {
        const angle = Phaser.Math.Angle.BetweenPoints(this, from);
        const velocity = AngleToVector2(angle, force);
        this.setVelocity(this.body.velocity.x - velocity.x, this.body.velocity.y - velocity.y);
    }

    /**
     * @param component Class of the component, that you want to add
     * @return It returns instance of created component
     */
    public addComponent<T extends Component>(component: ClassConstructor<T>): T {
        const instance = new component;
        this.components.set(instance.id, instance);

        instance.creature = this;

        return instance;
    }

    public removeComponent(type: string): void {
        this.components.delete(type);
    }

    // public getComponent<T extends Component>(type: string): T | undefined {
    //     return this.components.get(type) as T;
    // }

    public getComponent<T extends Component>(component: ClassConstructor<T>): T | undefined {
        const instance = new component;
        return this.components.get(instance.id) as T;
    }

    public hasComponent<T extends Component>(type: ClassConstructor<T>): boolean {
        return this.components.has((new type).id);
    }

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