import Scene = Phaser.Scene;
import Vector2 = Phaser.Math.Vector2;
import Size = Phaser.Structs.Size;
import {GUIContainerOptions} from "./GUIContainer";

export type GUIContainerConfig = {
    scene: Scene,
    pos: Vector2,
    size: Size,
    depth?: number,
    enabled?: boolean,
    options?: GUIContainerOptions,
}