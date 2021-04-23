import { SoundId, TextureId } from "../../managers/registers/ResourceRegister";
import { GameData } from "../../../nerdEngine/data";

export interface SoundConfig {
    id: SoundId;
    /**
     * From 0 (silent) to 1 (full volume)
     */
    volume: number
}

export interface WeaponConfig {
    textureId: TextureId;
    gunshotSound?: SoundConfig,
    offset: number;
    reloadTime: GameData;
    knockback: number;
    flipX: boolean;
    cameraShakeIntensity: number;
    cameraShakeDuration: number;
}