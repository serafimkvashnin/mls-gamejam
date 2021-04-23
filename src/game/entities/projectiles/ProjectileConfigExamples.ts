import { BasicBulletBehavior } from "./behaviours/ProjectileBehavior";
import { GameData } from "../../../nerdEngine/data";
import { TextureId } from "../../registry/enums/TextureId";
import { ProjectileConfig } from "./ProjectileConfig";

export const BasicBullet: ProjectileConfig = {
    textureId: TextureId.Bullet,
    damage: new GameData("Damage", 1),
    speed: 3,
    lifetime: 500,
    knockback: 150,
    behavior: BasicBulletBehavior,
};

export const CheatBullet: ProjectileConfig = {
    textureId: TextureId.Bullet,
    damage: new GameData("Damage", 10),
    speed: 3,
    lifetime: 500,
    knockback: 500,
    behavior: BasicBulletBehavior,
};
