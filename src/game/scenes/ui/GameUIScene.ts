import { UIScene } from "./UIScene";
import { SceneId } from "../../registry/enums/SceneId";
import { GameScene } from "../GameScene";
import { IScene } from "../IScene";

export class GameUIScene extends UIScene<GameScene> implements IScene {

    constructor(owner: GameScene) {
        super({
            key: SceneId.GameUIScene,
        }, owner);
    }

    create() {
       super.create();
    }

    update(time: number, delta: number): void {
        super.update(time, delta);
    }

    updateUI() {

    }
}