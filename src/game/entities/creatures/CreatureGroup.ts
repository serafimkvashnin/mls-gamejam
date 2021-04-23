import { GameScene } from "../../scenes/GameScene";
import { Entity } from "../Entity";
import { Creature } from "./Creature";

export class CreatureGroup extends Phaser.GameObjects.Group {
    public readonly scene: GameScene;

    public readonly onAnyoneDeath: GameEvent<Creature, { from: Creature | Entity }>;

    public constructor(scene: GameScene) {
        super(scene);
        this.scene = scene;
        
        this.onAnyoneDeath = new GameEvent();
    }

    public sortY(): void {
        this.children.entries.slice().forEach(child => {
            const sprite = child as Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
            sprite.depth = child.body.position.y;
        });
    }
}