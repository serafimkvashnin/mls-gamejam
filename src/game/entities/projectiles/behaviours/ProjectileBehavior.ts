import { angleToVector2 } from "../../../utils/helpers/MathHelper";
import { IProjectile } from "../IProjectile";
import { ProjectileConfig } from "../ProjectileConfig";

export function BasicBulletBehavior(projectile: IProjectile & { config: ProjectileConfig }, delta: number): void {
    const velocity = angleToVector2(projectile.rotation, projectile.config.speed * delta);
    projectile.setVelocity(velocity.x, velocity.y);
}