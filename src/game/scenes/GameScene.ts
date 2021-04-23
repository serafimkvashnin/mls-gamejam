import { Physics, Scene } from "phaser";
import { IGameScene } from "./IGameScene";
import { GameUIScene } from "./ui/GameUIScene";

export class GameScene extends Scene implements IGameScene {
    private ui!: GameUIScene;

    public create(): void {
        this.registerCollisions();
    }

    public update(time: number, delta: number): void {
        
    }

    protected registerCollisions(): void {
        
    }
}