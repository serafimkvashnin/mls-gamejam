import Layer = Phaser.GameObjects.Layer;
import GameObject = Phaser.GameObjects.GameObject;
import Scene = Phaser.Scene;
import {IsObjectOfType} from "../../utils/TypeCheck";
import {GUIContainer} from "../GUIContainer";

export class GameLayer {
    public readonly scene: Scene;
    public readonly layer: Layer;

    constructor(scene: Scene, gameObjects?: GameObject | GameObject[]) {
        this.layer = scene.add.layer(gameObjects);
        this.scene = scene;
    }

    add(gameObjects?: GameObject | GameObject[]) {
        let items = gameObjects ? (Array.isArray(gameObjects) ? gameObjects : [ gameObjects ]) : []
        items.forEach(item => this.layer.add(item));
    }

    getChildren() {
        return this.layer.getChildren();
    }

    setVisible(value: boolean, updateActive: boolean = true, updateInput: boolean = true) {
        this.layer.setVisible(value);

        if (updateActive) {
            this.setActive(value);
        }

        if (updateInput) {
            this.setAccess(value);
        }
    }

    setActive(value: boolean, updateActive: boolean = true) {
        this.layer.setActive(value);

        if (updateActive) {
            //todo do i need this? need to check (as i remember - yes)
            this.layer.getChildren().forEach(c => c.setActive(value))
        }
    }

    setAccess(value: boolean) {
        this.layer.getChildren().forEach(c => {
            if (IsObjectOfType(c, GUIContainer.TYPE_NAME)) {
                (c as GUIContainer).setAccess(value);
            }
        })
    }
}