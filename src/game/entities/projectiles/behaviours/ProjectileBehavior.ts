import { angleToVector2 } from "../../../utils/MathHelper";
import { Projectile } from "../Projectile";

export function BasicBulletBehavior(projectile: Projectile, delta: number): void {
    const velocity = angleToVector2(projectile.rotation, projectile.config.speed * delta);
    projectile.setVelocity(velocity.x, velocity.y);
}