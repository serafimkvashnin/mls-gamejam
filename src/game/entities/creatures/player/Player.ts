import { Creature } from "../Creature";
import { GameEvent } from "../../../../nerdEngine/components";
import Key = Phaser.Input.Keyboard.Key;
import Vector2 = Phaser.Math.Vector2;
import { Constants } from "../../../utils/Constants";
import { RangeWeapon } from "../../weapons/range/RangeWeapon";
import { GameScene } from "../../../scenes/GameScene";
import { TextureId } from "../../../registry/enums/TextureId";

export class Player extends Creature {
    public readonly PlayerEvents = {
        OnStartedRunning: new GameEvent<Player, {}>(),
        OnStoppedRunning: new GameEvent<Player, {}>(),
    }

    private controls: {
        Left: Key,
        Right: Key,
        Up: Key,
        Down: Key,
    }

    constructor(scene: GameScene, x: number = 0, y: number = 0) {
        super(scene, x, y, TextureId.Blank);

        this.health.setHealth(10, this);
        this.health.setMaxHealth(10, this);
        //this.health.unhittable = true;

        this.controls = {
            Left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            Right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            Up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            Down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        }
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

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
    }
}