import { SoundId, TextureId } from "../../managers/registers/ResourceRegister";
import { GameData } from "../../../nerdEngine/data";

export interface WeaponConfig {
    textureId: TextureId;
    soundId: SoundId;
    soundConfig?: Phaser.Types.Sound.SoundConfig;
     /** Offset from the weapon owner. */
    offset: number;
    flipX: boolean;

    reloadTime: GameData;
    knockback: number;

    shakeIntensity: number;

    /** When value is higher than 80, player could go off screen. */
    fieldOfView: number;
}