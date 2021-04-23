import { Creature } from "../Creature";
import { GameData } from "../../../../nerdEngine/data";
import { GameEvent } from "../../../../nerdEngine/components";
import { TextureId } from "../../../managers/registers/ResourceRegister";
import { Weapon } from "../../weapons/Weapon";
import Key = Phaser.Input.Keyboard.Key;
import { Game } from "../../../../app";
import Vector2 = Phaser.Math.Vector2;
import { getMouseScreenPosition, getMouseWorldPosition } from "../../../utils/MouseHelper";
import { angleToVector2 } from "../../../utils/MathHelper";
import { Constants } from "../../../utils/Constants";
import { RangeWeapon } from "../../weapons/range/RangeWeapon";
import { GameScene } from "../../../scenes/game/GameScene";

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

    private accelerationForce: GameData;// = new GameData("Acceleration", 250);
    private decelerationForce: GameData;// = new GameData("Deceleration", 500);

    constructor(scene: GameScene, x: number = 0, y: number = 0) {
        super(scene, x, y, "player");

        this.health.setHealth(10, this);
        this.health.setMaxHealth(10, this);
        //this.health.unhittable = true;

        this.controls = {
            Left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            Right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            Up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            Down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        }

        this.accelerationForce = Game.Content.player.stats.acceleration;
        this.decelerationForce = new GameData("Deceleration", 500); //todo TEMP

        this.events.onPreDeath.Register(() => {
            console.log('player is dead')
            Game.Engine.Loading.SkipNextLoad();
            Game.Engine.Loading.RestartToLoad();
        })

        this.anims.create({
            key: "Teleport",
            frames: TextureId.TeleportEffect,
            frameRate: 15,
            repeat: 0,
        });

        this.play("Teleport");

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

        this.setDrag(this.decelerationForce.Value.AsNumber);
        // this.setMaxVelocity(this.acceleration.Value.AsNumber);

        // this.acceleration.Events.OnChanged.Register((sender, args) => {
        //     this.setMaxVelocity(args.value.AsNumber);
        // })

        this.weapon = new RangeWeapon(this.scene, Game.Content.weapons.weapons.cheatWeapon, this, this.scene.projectileGroup);
        //this.weapon.config.reloadTime = Game.Content.player.permanentUpgrades.reloadTime;
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        this.play("Player Idle", true);

        //#region movement
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

        // TODO: fix, this do nothing
        input = input.normalize();
        
        this.accelerate(
            input.x * this.accelerationForce.Value.AsNumber, 
            input.y * this.accelerationForce.Value.AsNumber,
            this.accelerationForce.Value.AsNumber
        );
        // this.setAcceleration( 
        //     input.x * this.acceleration.Value.AsNumber * delta * (1 - percentx),
        //     input.y * this.acceleration.Value.AsNumber * delta * (1 - percenty)
        // );
        
        //#endregion

        const worldMousePosition = getMouseWorldPosition(this.scene.cameras.main);
        this.flipX = worldMousePosition.x < this.x;

        //#region weapon
        this.weapon?.aimAt(worldMousePosition);
        if (this.scene.input.mousePointer.leftButtonDown()) this.weapon.attack();
        if (this.scene.input.mousePointer.leftButtonReleased() && this.weapon instanceof RangeWeapon) {
            this.weapon.canShoot = true; 
        }  
        //#endregion

        //#region camera offset
        if (this.weapon.config.fieldOfView) {
            const screenMousePosition = getMouseScreenPosition(this.scene.cameras.main);
            const distance = Phaser.Math.Distance.Between(Constants.ScreenHalfWidth, Constants.ScreenHalfHeight, screenMousePosition.x, screenMousePosition.y);
            const rotation = Phaser.Math.Angle.Between(Constants.ScreenHalfWidth, Constants.ScreenHalfHeight, screenMousePosition.x, screenMousePosition.y);
            const clampedOffset = Phaser.Math.Clamp(distance, -this.weapon.config.fieldOfView, this.weapon.config.fieldOfView);
            const rotatedOffset = angleToVector2(rotation, clampedOffset);

            this.scene.cameras.main.setFollowOffset(-rotatedOffset.x, -rotatedOffset.y);   
        }
        //#endregion
    }
}