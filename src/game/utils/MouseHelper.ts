import Vector2 = Phaser.Math.Vector2;
import Camera = Phaser.Cameras.Scene2D.Camera;

export class MouseHelper {

    static fixWorldPosition(camera: Camera, x: number, y: number): Vector2 {
        return camera.getWorldPoint(x, y);
    }

    static getMouseWorld(camera: Camera): Vector2 {
        return MouseHelper.fixWorldPosition(camera,
            camera.scene.input.activePointer.worldX,
            camera.scene.input.activePointer.worldY);
    }
}