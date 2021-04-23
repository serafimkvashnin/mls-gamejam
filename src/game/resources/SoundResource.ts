import LoaderPlugin = Phaser.Loader.LoaderPlugin;

import { Resource, SoundType} from "./Resource";

export class SoundResource extends Resource {
    constructor(id: string, path: string) {
        super(SoundType.Sound, id, path);
    }

    Load(loader: LoaderPlugin) {
        loader.audio(this.Id, this.Path, );
    }
}