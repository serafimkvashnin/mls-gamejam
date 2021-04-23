import { Scene } from "phaser";
import Vector2 = Phaser.Math.Vector2;
import Camera = Phaser.Cameras.Scene2D.Camera;

export function getMouseWorldPosition(camera: Camera): Vector2 {
    return camera.getWorldPoint(
        camera.scene.input.activePointer.worldX,
        camera.scene.input.activePointer.worldY);
}

export function  getMouseScreenPosition(camera: Camera): Vector2 {
    return new Vector2(camera.scene.input.activePointer.x, camera.scene.input.activePointer.y);
}
