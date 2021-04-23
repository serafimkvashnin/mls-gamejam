export function AngleToVector2(angle: number, offset: number = 1): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(Math.cos(angle) * offset, Math.sin(angle) * offset);
}