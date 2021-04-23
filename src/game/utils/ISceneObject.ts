import { Scene } from "phaser";

export interface ISceneObject<T extends Scene = Scene> {
    scene: T;
}