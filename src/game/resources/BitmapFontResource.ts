import { Resource, TextureType } from "./Resource";
import LoaderPlugin = Phaser.Loader.LoaderPlugin;

export class BitmapFontResource extends Resource {
    private readonly dataPath: string;
    constructor(id: string, path: string, dataPath: string) {
        super(TextureType.Image, id, path);
        this.dataPath = dataPath;
    }

    Load(loader: LoaderPlugin) {
        loader.bitmapFont(this.Id, this.Path, this.dataPath);
    }
}