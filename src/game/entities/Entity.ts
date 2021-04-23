import GameObject = Phaser.GameObjects.GameObject;
import {Player} from "./creatures/player/Player";
import { Scene } from "phaser";
import { GameScene } from "../scenes/GameScene";

export class Entity extends Phaser.Physics.Arcade.Image {
    public readonly scene: GameScene;

    constructor(scene: GameScene, x: number = 0, y: number = 0, textureId: string) {
        super(scene, x, y, textureId);
        this.scene = scene;
        
        this.scene.add.existing(this);
    }
}