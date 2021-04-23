//todo support loader scene?

import {SceneID} from "./registers/SceneID";
import {GameEngine} from "../../app";
import Scene = Phaser.Scene;
import Camera = Phaser.Cameras.Scene2D.Camera;

export class SceneSelector {
    public readonly Engine: GameEngine;

    constructor(engine: GameEngine) {
        this.Engine = engine;
    }

    //todo fade effects
    SwitchScene(currentScene: Scene, switchTo: SceneID) {
        console.log(`[SceneManager] Moving from '${currentScene.scene.key}' to '${switchTo}'`);
        this.Engine.scene.switch(currentScene.scene.key, switchTo);
        (<any>window).scene = this.Engine.scene.getScene(switchTo);
    }
}