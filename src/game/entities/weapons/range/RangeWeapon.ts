import { ProjectileGroup } from "../../projectiles/group/ProjectileGroup";
import { RangeWeaponConfig } from "./RangeWeaponConfig";
import { Weapon } from "../Weapon";
import { Projectile } from "../../projectiles/Projectile";
import Transform = Phaser.GameObjects.Components.Transform;
import { Scene } from "phaser";
import { Creature } from "../../creatures/Creature";

export class RangeWeapon extends Weapon {
    public config: RangeWeaponConfig;

    protected projectileGroup: ProjectileGroup;

    constructor(scene: Scene, config: RangeWeaponConfig, owner: Creature, projectileGroup?: ProjectileGroup) {
        super(scene, config, owner);

        this.config = config;
        this.projectileGroup = projectileGroup ?? new ProjectileGroup(this.scene);
    }

    public attack(): void {
        if (this.reloading) return;
        
        const muzzlePosition = this.getMuzzlePosition();
        if (this.config.gunshotSound) {
            this.scene.sound.play(this.config.gunshotSound.id, {
                volume: this.config.gunshotSound.volume
            })
        }
        
        const projectile: Projectile = this.projectileGroup.getReadyProjectile(muzzlePosition.x, muzzlePosition.y, this.config.projectile);
        projectile.setRotation(this.rotation);

        this.owner.addImpulse(muzzlePosition, this.config.knockback);

        this.scene.cameras.main.shake(this.config.cameraShakeDuration, this.config.cameraShakeIntensity);

        // TODO: move to Weapon somehow @Sima and use this.scene.time @Felix
        setTimeout(() => this.reloading = false, this.config.reloadTime.Value.AsNumber);

        this.reloading = true;
    }

    protected getMuzzlePosition(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(
            this.x + Math.cos(this.rotation) * this.config.offset,
            this.y + Math.sin(this.rotation) * this.config.offset
        );
    }
}