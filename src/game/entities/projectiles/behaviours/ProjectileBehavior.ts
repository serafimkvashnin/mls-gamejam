import { Projectile } from "../Projectile";

export function BasicBulletBehavior(projectile: Projectile, delta: number): void {
    projectile.setVelocity(
        Math.cos(projectile.rotation) * projectile.config.speed * delta,
        Math.sin(projectile.rotation) * projectile.config.speed * delta
    );
}