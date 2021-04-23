import GameObject = Phaser.GameObjects.GameObject;
import {Player} from "./creatures/player/Player";
import { Scene } from "phaser";

export class Entity extends Phaser.Physics.Arcade.Image {
    constructor(scene: Scene, x: number, y: number, textureId: string) {
        super(scene, x, y, textureId);

        this.scene.add.existing(this);
    }
}