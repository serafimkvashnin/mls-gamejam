import { ProjectileConfig } from "../../projectiles/ProjectileConfig";
import { WeaponConfig } from "../WeaponConfig";

export interface RangeWeaponConfig extends WeaponConfig {
    accuracy: number;
    spread: number;
    projectile: ProjectileConfig;
}