import LoaderPlugin = Phaser.Loader.LoaderPlugin;
import {Resource, TextureType} from "./Resource";

export class ImageResource extends Resource {
    constructor(id: string, path: string) {
        super(TextureType.Image, id, path);
    }

    Load(loader: LoaderPlugin) {
        loader.image(this.Id, this.Path);
    }
}