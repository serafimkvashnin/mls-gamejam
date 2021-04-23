import { Scene } from "phaser";
import { IGameScene } from "./IGameScene";

export class GameScene extends Scene implements IGameScene {
    //note: чёт я не уверен что нам это надо. интерфейс есть в конкретной сцене, и какой-то свой, не в каждой игровой
    // + это цикл. зависимость
    //private ui!: GameUIScene;

    public create(): void {
        this.registerCollisions();
    }

    public update(time: number, delta: number): void {
        
    }

    protected registerCollisions(): void {
        
    }
}