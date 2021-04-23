import { SceneID } from "../managers/registers/SceneID";
import { TextureId } from "../managers/registers/ResourceRegister";
import Image = Phaser.GameObjects.Image;
import Key = Phaser.Input.Keyboard.Key;
import Vector2 = Phaser.Math.Vector2;

export class JamScene extends Phaser.Scene {
    constructor() {
        super({
            key: SceneID.JamScene,
        });
    }

    private serafim!: Image;
    private controls!: {
        Left: Key,
        Right: Key,
        Up: Key,
        Down: Key,
    }

    create() {
        this.cameras.main.setBackgroundColor("#449e8d")
        this.serafim = this.add.image(this.cameras.main.width/2, this.cameras.main.height/2, TextureId.SerafimHead);

        this.controls = {
            Left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            Right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            Up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            Down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        }


    }

    preload() {

    }

    update(time: number, delta: number): void {
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

        if (input.x || input.y) {
            this.serafim.x += input.x * 20;
            this.serafim.y += input.y * 20;
        }
    }
}