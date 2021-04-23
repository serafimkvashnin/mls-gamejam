import { Creature } from "../Creature";
import Transform = Phaser.GameObjects.Components.Transform;
import { GameScene } from "../../../scenes/GameScene";
import { TextureId } from "../../../registry/enums/TextureId";

export abstract class Enemy extends Creature {
    private target?: Transform;

    constructor(scene: GameScene, x: number, y: number, textureId: TextureId) {
        super(scene, x, y, textureId);
    }

    public preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        this.flipX = this.body.velocity.x < 0;
    }
}