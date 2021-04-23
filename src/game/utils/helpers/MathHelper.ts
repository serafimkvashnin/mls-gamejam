export function angleToVector2(angle: number, offset: number = 1): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(Math.cos(angle) * offset, Math.sin(angle) * offset);
}

export function randomPositionInsideCircle(radius: number, xOffset: number = 0, yOffset: number = 0): Phaser.Math.Vector2 {
    const radiusSquared = radius * radius * Math.random();
    const angle = Math.random() * 2 * Math.PI;

    const x = Math.sqrt(radiusSquared) * Math.cos(angle) + xOffset;   
    const y = Math.sqrt(radiusSquared) * Math.sin(angle) + yOffset;   

    return new Phaser.Math.Vector2(x, y);
}