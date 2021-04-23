import LoaderPlugin = Phaser.Loader.LoaderPlugin;
import FilterMode = Phaser.Textures.FilterMode;
import { Resource, SoundType, TextureType } from "./Resource";

export class SoundResource extends Resource {
    constructor(id: string, path: string) {
        super(SoundType.Sound, id, path);
    }

    Load(loader: LoaderPlugin) {
        loader.audio(this.Id, this.Path, );
    }
}