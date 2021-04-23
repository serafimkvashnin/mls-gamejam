import { Creature } from "../Creature";
import { GameData } from "../../../../nerdEngine/data";
import { MouseHelper } from "../../../utils/MouseHelper";
import { GameEvent } from "../../../../nerdEngine/components";
import { TextureId } from "../../../managers/registers/ResourceRegister";
import { Weapon } from "../../weapons/Weapon";
import Key = Phaser.Input.Keyboard.Key;
import { Game } from "../../../../app";
import { Scene } from "phaser";
import Vector2 = Phaser.Math.Vector2;
import { HealthComponent } from "../../components/HealthComponent";

export class Player extends Creature {
    public readonly PlayerEvents = {
        OnStartedRunning: new GameEvent<Player, {}>(),
        OnStoppedRunning: new GameEvent<Player, {}>(),
    }

    //protected speed!: GameData;
    public weapon!: Weapon;

    private controls: {
        Left: Key,
        Right: Key,
        Up: Key,
        Down: Key,
    }

    // private animations: {
    //     Idle: Animation,
    //     Run: Animation,
    // }

    private acceleration: GameData;// = new GameData("Acceleration", 250);
    private deceleration: GameData;// = new GameData("Deceleration", 500);

    constructor(scene: Scene, x: number = 0, y: number = 0) {
        super(scene, x, y, "player");
        
        const health = this.getComponent(HealthComponent);
        health?.setHealth(1000, this); //todo should we make run-only health upgrade? or only permanent health upgrade is fine?
        health?.setMaxHealth(1000, this);
        //this.getComponent<HealthComponent>(typeof HealthComponent)?.invincibilityTime

        this.controls = {
            Left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            Right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            Up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            Down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        }

        this.acceleration = Game.Content.player.stats.acceleration;
        this.deceleration = new GameData("Deceleration", 9999); //todo TEMP

        this.onDeath.Register(() => {
            console.log('player is dead')
            Game.Engine.Loading.SkipNextLoad();
            Game.Engine.Loading.RestartToLoad();
        })

        // this.animations = {
        //     Idle: <Animation>this.anims.create({
        //         key: "Idle",
        //         frames: TextureId.PlayerIdle,
        //         frameRate: 10,
        //         repeat: -1,
        //     }),

        //     Run: <Animation>this.anims.create({
        //         key: "Run",
        //         frames: TextureId.PlayerRunning,
        //         frameRate: 10,
        //         repeat: -1,
        //     })
        // }

        this.setDrag(this.deceleration.Value.AsNumber);
        this.setMaxVelocity(this.acceleration.Value.AsNumber);

        this.acceleration.Events.OnRecomputed.Register((sender, args) => {
            this.setMaxVelocity(args.newValue.AsNumber);
        })
    }
    
    public update(time: number, delta: number): void {
        let input = new Vector2(0, 0);

        if (this.controls.Up.isDown) {
            input.y = -1;
        } else if (this.controls.Down.isDown) {
            input.y = 1;
        }

        if (this.controls.Right.isDown) {
            input.x = 1;
        } else if (this.controls.Left.isDown) {
            input.x = -1;
        }

        //input = input.normalize();

        this.setAcceleration( 
            input.x * this.acceleration.Value.AsNumber * delta,
            input.y * this.acceleration.Value.AsNumber * delta
        );

        const mousePosition = MouseHelper.getMouseWorld(this.scene.cameras.main);
        
        this.weapon?.aimAt(mousePosition);

        if (this.scene.input.mousePointer.leftButtonDown()) this.weapon?.attack();  

        this.flipX = mousePosition.x < this.x;
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        this.play("Player Idle", true);

        // if (this.body.velocity.x != 0 || this.body.velocity.y != 0) {
        //     let run = this.playAnimation(this.animations.Run.key);
        //     if (run) {
        //         this.PlayerEvents.OnStartedRunning.Trigger(this, {});
        //     }
        // } else {
        //     let idle = this.playAnimation(this.animations.Idle.key);
        //     if (idle) {
        //         this.PlayerEvents.OnStoppedRunning.Trigger(this, {});
        //     }
        // }
    }
}