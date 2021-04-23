import { BasicBullet } from "../ProjectileConfigExamples";
import { Scene } from "phaser";
import { Projectile } from "../Projectile";
import { EntityGroup } from "../../EntityGroup";
import { TextureId } from "../../../registry/enums/TextureId";
import { ProjectileConfig } from "../ProjectileConfig";

export class ProjectileGroup extends EntityGroup {

    constructor(scene: Scene, quantity: number = 10, config: ProjectileConfig = BasicBullet) {
        super(scene);

        this.createCallback = item => {
            this.createProjectile(item as Projectile, config);
            this.scene.physics.world.disable(item);
        }

        this.createMultiple({
            classType: Projectile,
            quantity: quantity,
            active: false,
            visible: false,
            key: TextureId.Bullet
        });
    }

    /** @returns a projectile ready for use. */
    public getProjectile(x: number, y: number, rotation: number, config: ProjectileConfig): Projectile {
        const projectile = <Projectile> this.getFirstDead(true);
        projectile.reset(x, y, rotation, config);
        projectile.setVisible(true);
        projectile.setActive(true);
        projectile.setTexture(projectile.config.textureId);
        this.scene.physics.world.enable(projectile);
        return projectile;
    }

    public killAndHide(projectile: Projectile): void {
        super.killAndHide(projectile);
        projectile.body.stop();
        this.scene.physics.world.disable(projectile);  
    }

    protected createProjectile(projectile: Projectile, config: ProjectileConfig): Projectile {
        projectile.reset(projectile.x, projectile.y, projectile.rotation, config);
        projectile.onDeath.Register((projectile) => this.killAndHide(projectile));
        return projectile;
    }
}