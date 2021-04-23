import {ImageResource} from "../resources/ImageResource";
import {SpriteSheetResource} from "../resources/SpriteSheetResource";
import { SoundResource } from "../resources/SoundResource";

//Question: Should we split TextureId to ImageID, SpriteSheetID and so on? @Felix

export enum TextureId {
    PlayerRunning = "PlayerRunning",

    MonsterIdle = "MonsterIdle",
    MonsterDead = "MonsterDead",

    Bullet = "Bullet",
    Wall = "Wall",
    Pistol = "Pistol",

    Pan = "Pan",

    WalletsCoin = "WalletsCoin",
}

export enum SoundId {
    Hit = "Hit",
    EggDeath = "EggDeath",
    Gunshot = "Gunshot",
    YolkFast = "YolkFast",
    Yolk = "Yolk",
}

export enum MusicId {
    Illest = "Illest",
}

export class ResourceRegister {
    static Textures: {[key: string] : ImageResource | SpriteSheetResource} = {

        // Player
        PlayerRunning: new SpriteSheetResource(TextureId.PlayerRunning, "assets/sprites/Eggs.png", {
            frameWidth: 16,
            frameHeight: 20,
            startFrame: 0,
            endFrame: 3,
        }),

        // Monster
        MonsterIdle: new SpriteSheetResource(TextureId.MonsterIdle, "assets/sprites/Eggs.png", {
            frameWidth: 16,
            frameHeight: 20,
            startFrame: 5,
            endFrame: 7,
        }),

        MonsterDead: new ImageResource(TextureId.MonsterDead, "assets/sprites/sEnemyDead.png"),

        Bullet: new ImageResource(TextureId.Bullet, "assets/sprites/bullet.png"),
        Wall: new ImageResource(TextureId.Wall, "assets/sprites/sWall.png"),
        Gun: new ImageResource(TextureId.Pistol, "assets/sprites/guns.png"),

        Pan: new ImageResource(TextureId.Pan, "assets/sprites/pan.png"),

        WalletsCoin: new ImageResource(TextureId.WalletsCoin, "assets/sprites/wallets/sCoin.png"),
    }

    static Sounds: {[key: string] : ImageResource | SpriteSheetResource} = {
        EggDeath: new SoundResource(SoundId.EggDeath, "assets/sounds/eggDeath.mp3"),
        Hiy: new SoundResource(SoundId.Hit, "assets/sounds/hit.wav"),
        Gunshot: new SoundResource(SoundId.Gunshot, "assets/sounds/gunshot.wav"),
        Illest: new SoundResource(MusicId.Illest, "assets/sounds/music/VYVCH - Illest.mp3"),

        Yolk: new SoundResource(SoundId.Yolk, "assets/sounds/yolk.wav"),
        YolkFast: new SoundResource(SoundId.YolkFast, "assets/sounds/yolkFast.wav"),
    }
}