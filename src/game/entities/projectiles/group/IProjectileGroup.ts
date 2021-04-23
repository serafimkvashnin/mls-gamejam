
import { GameEvent } from "../../../../nerdEngine";
import { Projectile } from "../Projectile";

export interface IProjectileGroup {
    onProjectileDone: GameEvent<Projectile, {}>;
}