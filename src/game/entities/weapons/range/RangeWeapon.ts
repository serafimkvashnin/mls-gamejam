import { ProjectileGroup } from "../../projectiles/group/ProjectileGroup";
import { RangeWeaponConfig } from "./RangeWeaponConfig";
import { Weapon } from "../Weapon";
import { Creature } from "../../creatures/Creature";
import { Constants } from "../../../utils/Constants";
import { GameScene } from "../../../scenes/GameScene";
import { TextureId } from "../../../registry/enums/TextureId";
import { LayerId } from "../../../registry/enums/LayerId";
import { angleToVector2 } from "../../../utils/helpers/MathHelper";

export class RangeWeapon extends Weapon {
    public config: RangeWeaponConfig;

    protected muzzleFlash: Phaser.GameObjects.Image;
    protected projectileGroup: ProjectileGroup;

    /** Can this gun shoot or not depending on `gun.config.automatic` property. Do not forget to reset it.  */
    public canShoot: boolean = true;

    constructor(scene: GameScene, config: RangeWeaponConfig, owner: Creature, projectileGroup?: ProjectileGroup) {
        super(scene, config, owner);

        this.config = config;
        this.projectileGroup = projectileGroup ?? new ProjectileGroup(this.scene);

        this.muzzleFlash = this.scene.add.image(this.x, this.y, TextureId.MuzzleFlash);
        this.muzzleFlash.setDepth(LayerId.Front);
        this.muzzleFlash.setVisible(false);
    }

    public attack(): void {
        if (!this.canAttack || !this.canShoot || this.reloading) return;
        
        const getMuzzleFlashPosition = (): Phaser.Math.Vector2 => {
            return new Phaser.Math.Vector2(
                this.x + Math.cos(this.rotation) * this.config.offset,
                this.y + Math.sin(this.rotation) * this.config.offset
            );
        }

        const reload = (): void => {
            setTimeout(() => { 
                // reloading recoil
                const rotatedPosition = angleToVector2(this.rotation, Constants.ReloadingRecoil);
                this.setPosition(this.x - rotatedPosition.x, this.y - rotatedPosition.y);
                this.reloading = false;
            }, this.config.reloadTime.Value.AsNumber);  
        }

        const shoot = (angle: number): void => {
            this.scene.sound.play(this.config.soundId, this.config.soundConfig);
    
            //#region muzzleFlash
            const muzzlePosition = getMuzzleFlashPosition();
            if (this.config.muzzleFlash) {
                this.muzzleFlash.setPosition(muzzlePosition.x, muzzlePosition.y);
                this.muzzleFlash.setRotation(this.rotation);
                this.muzzleFlash.setVisible(true);
                setTimeout(() => { 
                    this.muzzleFlash.setVisible(false); 
                    this.projectileGroup.getProjectile(
                        muzzlePosition.x, 
                        muzzlePosition.y, 
                        angle + (1 - this.config.accuracy) * Phaser.Math.RND.realInRange(-Math.PI, Math.PI), 
                        this.config.projectile
                    );
                }, Constants.MuzzleFlashShowTimeMs);
            } else {
                this.projectileGroup.getProjectile(
                    muzzlePosition.x, 
                    muzzlePosition.y, 
                    angle + (1 - this.config.accuracy) * Phaser.Math.RND.realInRange(-Math.PI, Math.PI), 
                    this.config.projectile
                );
            }
            //#endregion
    
            // knockback
            this.owner.addImpulse(muzzlePosition, this.config.knockback);
    
            // camera shake
            this.scene.cameras.main.shake(Constants.ShakeDuration, this.config.shakeIntensity);
    
            // recoil
            const rotatedPosition = angleToVector2(this.rotation, this.config.recoil);
            this.setPosition(this.x - rotatedPosition.x, this.y - rotatedPosition.y);
        }

        this.reloading = true;

        //#region shooting
        const amount = this.config.amount;
        if (amount == 1) {
            shoot(this.rotation);
            reload();
        } else {
            const spreadAngleInRadians = Phaser.Math.DegToRad(this.config.spreadAngle);
            const increment = spreadAngleInRadians / (spreadAngleInRadians == 2 * Math.PI ? amount : amount - 1);
            const getRotation = (): number => this.rotation;
            const shootClockwise = (this.config.shootClockwise ? -1 : 1);
            let angle: number = getRotation() + shootClockwise * spreadAngleInRadians / 2;
            //shoot(angle);
            
            const burst = (i: number) => {
                setTimeout(() => {
                    shoot(angle);
                    angle = getRotation() - spreadAngleInRadians / 2;
                    angle += increment * (amount + shootClockwise * (i + 1));    
                    if (--i) {
                        burst(i);
                    } else {
                        reload();
                    } 
                }, this.config.delayPerShot)
            };
            burst(amount);
        }
        this.canShoot = this.config.automatic;
        //#endregion
    }
}