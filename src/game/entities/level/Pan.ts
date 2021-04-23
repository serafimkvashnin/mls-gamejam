import { Scene } from "phaser";
import { TextureId } from "../../managers/registers/ResourceRegister";
import { AngleToVector2 } from "../../utils/MathHelper";
import { CreatureGroup } from "../creatures/CreatureGroup";
import { Entity } from "../Entity";
import Vector2 = Phaser.Math.Vector2;

export class Pan extends Entity {
    public circle: Phaser.Geom.Circle;
    protected readonly panRadius: number = 102;
    protected readonly panBorderLeftMargin: number = 12;
    protected readonly panBorderUpMargin: number = 10;

    public constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, TextureId.Pan);

        this.depth = -9999;
        this.circle = new Phaser.Geom.Circle(-this.panRadius + this.panBorderLeftMargin, -this.panBorderUpMargin, this.panRadius);
    }

    public handleCollisions(creatureGroup: CreatureGroup) {
        // REMARK: really messy
        creatureGroup.children.each(item => {
            const sprite = item as Phaser.GameObjects.Sprite;
            const spriteHalfSize = new Vector2(sprite.width / 2, sprite.height / 2);
            const distance = Phaser.Math.Distance.Between(
                item.body.position.x + spriteHalfSize.x, item.body.position.y + spriteHalfSize.y, 
                this.circle.x, this.circle.y
            );
            if (distance > this.circle.radius) {
                const angle = Phaser.Math.Angle.Between(
                    this.circle.x, this.circle.y, 
                    item.body.position.x + spriteHalfSize.x, item.body.position.y + spriteHalfSize.y
                );
                const clampedPosition = new Vector2(this.circle.x, this.circle.y)
                    .add(AngleToVector2(angle, this.circle.radius))
                    .subtract(spriteHalfSize);
                item.body.position = clampedPosition;
            }
        });
    }

    public getRandomPositionInside(): Vector2 {
        const radius = this.circle.radius * Math.sqrt(Phaser.Math.Between(0, 1));
        const theta = Phaser.Math.Between(0, 1) * 2 * Math.PI;

        const x = this.circle.x - this.circle.radius / 2 + radius * Math.cos(theta);   
        const y = this.circle.y - this.circle.radius / 2 + radius * Math.cos(theta);   

        return new Vector2(x, y);
    }
}