//Question: Should we split TextureId to ImageID, SpriteSheetID and so on? @Felix

import { MusicId } from "./enums/MusicId"
import { SoundId } from "./enums/SoundId"
import { TextureId } from "./enums/TextureId"
import { ImageResource } from "../utils/resources/ImageResource"
import { SoundResource } from "../utils/resources/SoundResource"
import { SpriteSheetResource } from "../utils/resources/SpriteSheetResource"


export class ResourceRegistry {
    static Textures: {[key: string] : ImageResource | SpriteSheetResource} = {

        // Player
        PlayerIdle: new SpriteSheetResource(TextureId.PlayerIdle, "assets/sprites/Eggs.png", {
            frameWidth: 16,
            frameHeight: 20,
            startFrame: 0,
            endFrame: 3,
        }),

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
        BulletDeathEffect: new SpriteSheetResource(TextureId.BulletDeathEffect, "assets/sprites/effects/bullet_death.png", {
            frameWidth: 35,
            frameHeight: 35,
            startFrame: 0,
            endFrame: 3,
        }),

        HitEffect: new SpriteSheetResource(TextureId.HitEffect, "assets/sprites/effects/hit.png", {
            frameWidth: 26,
            frameHeight: 26,
            startFrame: 0,
            endFrame: 3,
        }),

        TeleportEffect: new SpriteSheetResource(TextureId.TeleportEffect, "assets/sprites/effects/egg_teleport.png", {
            frameWidth: 14,
            frameHeight: 64,
            startFrame: 0,
            endFrame: 2,
        }),

        AscensionEffect: new SpriteSheetResource(TextureId.AscensionEffect, "assets/sprites/effects/egg_ascension.png", {
            frameWidth: 40,
            frameHeight: 60,
            startFrame: 0,
            endFrame: 3,
        }),

        MuzzleFlash: new ImageResource(TextureId.MuzzleFlash, "assets/sprites/muzzle_flash.png"),
        Wall: new ImageResource(TextureId.Wall, "assets/sprites/sWall.png"),
        Gun: new ImageResource(TextureId.Pistol, "assets/sprites/guns.png"),

        Pan: new ImageResource(TextureId.Pan, "assets/sprites/pan.png"),


        WalletsCoin: new ImageResource(TextureId.WalletsCoin, "assets/sprites/wallets/sCoin.png"),
    }

    static Sounds: {[key: string] : ImageResource | SpriteSheetResource} = {
        EggDeath: new SoundResource(SoundId.EggDeath, "assets/sounds/eggDeath.mp3"),
        Hiy: new SoundResource(SoundId.Hit, "assets/sounds/hit.wav"),
        Gunshot: new SoundResource(SoundId.Gunshot, "assets/sounds/gunshot.wav"),
        Illest: new SoundResource(MusicId.Illset, "assets/sounds/music/VYVCH - Illest.mp3")
    }
}