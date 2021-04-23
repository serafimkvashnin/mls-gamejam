import { ContentModule } from "../../nerdEngine/content";
import { GameData } from "../../nerdEngine";
import { GameManager } from "../managers/GameManager";
import { RangeWeaponConfig } from "../entities/weapons/range/RangeWeaponConfig";
import { SoundId, TextureId } from "../managers/registers/ResourceRegister";
import { ProjectileConfig } from "../entities/projectiles/ProjectileConfig";
import { BasicBulletBehavior } from "../entities/projectiles/behaviours/ProjectileBehavior";

export class WeaponsContent {

    private readonly _weapons: ContentModule<{
        cheatWeapon: RangeWeaponConfig,
        pistol: RangeWeaponConfig,
    }>

    private readonly _bullets: ContentModule<{
        basic: ProjectileConfig,
        cheated: ProjectileConfig,
    }>

    constructor(public readonly GameManager: GameManager) {
        this._weapons = new ContentModule(GameManager.Engine, "Player.Weapons", () => ({
            //todo make all numbers to GameData
            cheatWeapon: {
                textureId: TextureId.Pistol,
                gunshotSound: {
                    id: SoundId.Gunshot,
                    volume: 0.5, //todo VolumeManager? :)
                },
                offset: 16,
                reloadTime: new GameData("ReloadTime", 50),
                knockback: 100,
                flipX: false,
                accuracy: 1,
                spread: 0,
                cameraShakeDuration: 100,
                cameraShakeIntensity: 0.0005,
                projectile: this.bullets.cheated
            },

            pistol: {
                textureId: TextureId.Pistol,
                gunshotSound: {
                    id: SoundId.Gunshot,
                    volume: 0.5, //todo VolumeManager? :)
                },
                offset: 16,
                reloadTime: new GameData("ReloadTime", 200),
                knockback: 50,
                flipX: false,
                accuracy: 1,
                spread: 0,
                cameraShakeDuration: 100,
                cameraShakeIntensity: 0.0001,
                projectile: this.bullets.basic
            }
        }))

        this._bullets = new ContentModule(GameManager.Engine, "Player.Bullets", () => ({
            basic: {
                textureId: TextureId.Bullet,
                damage: new GameData("Damage", 1),
                speed: 30,
                lifetime: 500,
                knockback: 150,
                behavior: BasicBulletBehavior,
            },

            cheated: {
                textureId: TextureId.Bullet,
                damage: new GameData("Damage", 10),
                speed: 30,
                lifetime: 500,
                knockback: 500,
                behavior: BasicBulletBehavior,
            },
        }))
    }

    // get weapons() {
    //     return this._weapons.Get();
    // }

    get pistol() {
        return this._weapons.Get().pistol;
    }

    get cheatWeapon() {
        return this._weapons.Get().cheatWeapon;
    }

    get bullets() {
        return this._bullets.Get();
    }
}