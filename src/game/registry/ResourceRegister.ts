//Question: Should we split TextureID to ImageID, SpriteSheetID and so on? @Felix
import { ImageResource } from "../resources/ImageResource"
import { SpriteSheetResource } from "../resources/SpriteSheetResource"

export enum TextureID {
    PlayerIdleAnim = "PlayerIdleAnim",
    PlayerRunAnim = "PlayerRunAnim",

    MonsterRunAnim = "MonsterRunAnim",
    MonsterDead = "MonsterDead",

    Bullet = "Bullet",
    Wall = "Wall",
    Pistol = "Pistol",
}

export class ResourceRegister {

    static Textures: {[key: string] : ImageResource | SpriteSheetResource} = {
        // MonsterRunAnim: new SpriteSheetResource(TextureID.MonsterRunAnim, "assets/sprites/sEnemy_strip7.png", {
        //     frameWidth: 40,
        //     frameHeight: 40,
        // }),

        //Bullet: new ImageResource(TextureID.Bullet, "assets/sprites/sBullet.png"),
    }

    static Sounds: (any)[] = [
        //todo
    ]
}