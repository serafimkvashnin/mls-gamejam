import { Scene } from "phaser";
import { TextureId } from "../managers/registers/ResourceRegister";

export class Cursor extends Phaser.GameObjects.Sprite {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, TextureId.Bullet);
    }

    update(): void {
        let x = this.scene.input.activePointer.x;
        let y = this.scene.input.activePointer.y;
        this.setPosition(x, y);
    }
}