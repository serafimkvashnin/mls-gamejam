import { WeaponConfig } from "../WeaponConfig";
import { ProjectileConfig } from "../../projectiles/ProjectileConfig";

export interface RangeWeaponConfig extends WeaponConfig {
    /** If the value is `0` then the gun could shoot all directions, if the value is `1` the gun has maximum accuracy. */
    accuracy: number;
    amount: number,
    spreadAngle: number;
    recoil: number;
    delayPerShot: number;
    shootClockwise: boolean;
    muzzleFlash: boolean;
    automatic: boolean;

    projectile: ProjectileConfig;
}