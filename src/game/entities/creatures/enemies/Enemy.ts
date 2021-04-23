import { Scene } from "phaser";
import { GameData, Reward } from "../../../../nerdEngine";
import { SoundId, TextureId } from "../../../managers/registers/ResourceRegister";
import { GameScene } from "../../../scenes/game/GameScene";
import { AngleToVector2 } from "../../../utils/MathHelper";
import { HealthComponent } from "../../components/HealthComponent";
import { Entity } from "../../Entity";
import { Creature } from "../Creature";
import Transform = Phaser.GameObjects.Components.Transform;
import { Game } from "../../../../app";


export class Enemy extends Creature {
    private target?: Transform;

    private animations: {
        Run: Phaser.Animations.Animation,
    }

    private speed: GameData;
    private reward: Reward;

    // если ты хочешь вынести часть логики в отдельный классы, почему просто не сделать так?
    // всё ради автоматического обновления всех компонентов?) @Felix
    //private health: HealthComponent;
    //private damage: DamageComponent;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, "enemy");

        this.animations = {
            Run: <Phaser.Animations.Animation>this.anims.create({
                key: "Run",
                frames: TextureId.MonsterIdle,
                frameRate: 10,
                repeat: -1,
            })
        }

        const stats = Game.Content.enemies.Egg;
        let health = this.getComponent(HealthComponent)!
        health.setHealth(stats.health.Value.AsNumber, this, true);

        this.onDeath.Register((from: Creature | Entity) => {
            Game.Content.wallets.Gold.Add(this.reward.Value);
            this.scene.sound.play(SoundId.EggDeath, {
                volume: 0.2,
            })
            this.destroy();
        });

        this.speed = new GameData("Speed", stats.speed.Value);
        this.reward = stats.reward;

        this.setDrag(1000);
        this.setMaxVelocity(50);

        this.scene.sound.play(SoundId.YolkFast, {
            volume: 0.5
        })
    }

    public update(time: number, delta: number): void {
        if(!this.target && !(this.target = (this.scene as GameScene).player)) return;
       
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
        const velocity = AngleToVector2(angle, this.speed.Value.AsNumber * delta);

        this.setAcceleration(velocity.x, velocity.y);
    }

    public preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        this.play({key: "Enemy Idle"}, true);
        this.flipX = this.body.velocity.x < 0;
        // if (this.body.velocity.x != 0 || this.body.velocity.y != 0) {
        //     this.flipX = this.body.velocity.x < 0;

        //     this.playAnimation(this.animations.Run.key)
        //     if (this.anims.isPaused) {
        //         this.anims.resume();
        //     }
        // } else {
        //     this.playAnimation(this.animations.Run.key)
        //     this.anims.setCurrentFrame(this.anims.currentAnim.getLastFrame());
        //     this.anims.pause();
        // }
    }
}