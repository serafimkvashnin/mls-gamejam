import Scene = Phaser.Scene;
import Pointer = Phaser.Input.Pointer;
import GameObject = Phaser.GameObjects.GameObject;
import {IsObjectOfType} from "../../utils/TypeCheck";
import Rectangle = Phaser.Geom.Rectangle;
import Point = Phaser.Geom.Point;
import {ScrollContainer} from "./ScrollContainer";

export class ScrollContainerController {

    public readonly scene: Scene;
    public scrollContainers: ScrollContainer[]
    public isEnabled: boolean;

    constructor(scene: Scene, items: ScrollContainer[] | ScrollContainer, isEnabled = true) {
        this.scene = scene;
        this.scrollContainers = Array.isArray(items) ? items : [ items ];
        this.isEnabled = isEnabled;

        this.scene.input.on('wheel', (pointer: Pointer, currentlyOver: GameObject[], dx: number, dy: number) => {
            let container = this.getNearestContainer(pointer.x, pointer.y);
            if (!container) return;
            else {
                if (container.getMaskRect() != null) {
                    if (!Phaser.Geom.Rectangle.ContainsPoint(
                        container.getMaskRect() as Rectangle,
                        new Point(pointer.x, pointer.y)))
                    {
                        return;
                    }
                }
                if (!container.canAccess()) return;
            }

            container.slider.drag(dy / 5);
        });
    }

    add(container: ScrollContainer) {
        this.scrollContainers.push(container);
    }

    resetPositions() {
        this.scrollContainers.forEach(container => container.resetPosition());
    }

    getNearestContainer(x: number, y: number): ScrollContainer | null {
        if (this.scrollContainers.length == 0) return null

        let getDistance = (x1: number, y1: number, x2: number, y2: number) => {
            let a = x1 - x2;
            let b = y1 - y2;

            return Math.sqrt( a*a + b*b );
        }

        let container: ScrollContainer = this.scrollContainers[0];
        let shortestDistance = getDistance(x, y, container.x, container.y);

        for (const item of this.scrollContainers) {
            let distance = getDistance(x, y, item.x, item.y);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                container = item;
            }
        }

        return container;
    }
}