import { TextureId } from "../../managers/registers/ResourceRegister";
import { BasicBulletBehavior } from "./behaviours/ProjectileBehavior";
import { Game } from "../../../app";
import { GameData } from "../../../nerdEngine/data";
import { Projectile } from "./Projectile";

// export const BasicBullet: ProjectileConfig = {
//     textureId: TextureId.Bullet,
//     damage: new GameData("Damage", 1),
//     speed: 30,
//     lifetime: 500,
//     knockback: 150,
//     behavior: BasicBulletBehavior,
// };
//
// export const CheatBullet: ProjectileConfig = {
//     textureId: TextureId.Bullet,
//     damage: new GameData("Damage", 10),
//     speed: 30,
//     lifetime: 500,
//     knockback: 500,
//     behavior: BasicBulletBehavior,
// };

export interface ProjectileConfig {
    textureId: TextureId;
    behavior: (projectile: Projectile, delta: number) => void;
    damage: GameData;
    speed: number;
    knockback: number;
    lifetime: number;
}
