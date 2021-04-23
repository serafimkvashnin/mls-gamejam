import { Physics, Scene } from "phaser";
import { SceneId } from "../registry/enums/SceneId";
import { IGameScene } from "./IGameScene";
import { GameUIScene } from "./ui/GameUIScene";

export class GameScene extends Scene implements IGameScene {
    private ui!: GameUIScene;

    public create(): void {
        this.ui = this.scene.launch(SceneId.GameUIScene, this).scene as GameUIScene;

        this.registerCollisions();
    }

    public update(time: number, delta: number): void {
        
    }

    protected registerCollisions(): void {
        
    }
}