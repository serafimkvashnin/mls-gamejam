import { Scene } from "phaser";
import { TextureId } from "../../registry/enums/TextureId";
import { Creature } from "./Creature";

export class Corpse extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, TextureId.Blank);

        this.scene.add.existing(this);
    }
}