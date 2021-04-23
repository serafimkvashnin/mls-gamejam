import { TextureId } from "../../registry/enums/TextureId";
import { IProjectile } from "./IProjectile";
import { GameData } from "../../../nerdEngine/data";

export interface ProjectileConfig {
    textureId: TextureId;
    behavior: (projectile: IProjectile & { config: ProjectileConfig }, delta: number) => void;
    damage: GameData;
    speed: number;
    knockback: number;
    lifetime: number;
}