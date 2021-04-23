import { Scene } from "phaser";
import { Creature } from "../Creature";
import { Player } from "../player/Player";
import Vector2 = Phaser.Math.Vector2;
import Clamp = Phaser.Math.Clamp;
import { Game } from "../../../../app";
import Transform = Phaser.GameObjects.Components.Transform;
import { Corpse } from "../Corpse";
import { HealthComponent } from "../../components/HealthComponent";
import { Entity } from "../../Entity";
import { Constants } from "../../../utils/Constants";
import { GameScene } from "../../../scenes/GameScene";
import { TextureId } from "../../../registry/enums/TextureId";
import { angleToVector2 } from "../../../utils/helpers/MathHelper";

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