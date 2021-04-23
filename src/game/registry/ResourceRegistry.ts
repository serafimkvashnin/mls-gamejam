import { TextureId } from "./enums/TextureId"
import { ImageResource } from "../resources/ImageResource"
import { SpriteSheetResource } from "../resources/SpriteSheetResource"


export class ResourceRegistry {
    static Textures: {[key: string] : ImageResource | SpriteSheetResource} = {
        SimpleZombieRunning: new SpriteSheetResource(TextureId.SimpleZombieRunning, "assets/sprites/zombies.png", {
            frameWidth: 8,
            frameHeight: 8,
            startFrame: 0,
            endFrame: 3,
        }),
    }
}