import LoaderPlugin = Phaser.Loader.LoaderPlugin;
import {Resource, TextureType} from "./Resource";
import ImageFrameConfig = Phaser.Types.Loader.FileTypes.ImageFrameConfig;

export class SpriteSheetResource extends Resource {
    readonly FrameConfig: ImageFrameConfig;
    constructor(id: string, path: string, frameConfig: ImageFrameConfig) {
        super(TextureType.SpriteSheet, id, path);
        this.FrameConfig = frameConfig;
    }

    Load(loader: LoaderPlugin) {
        loader.spritesheet(this.Id, this.Path, this.FrameConfig);
    }
}