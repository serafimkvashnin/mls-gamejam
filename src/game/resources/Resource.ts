import LoaderPlugin = Phaser.Loader.LoaderPlugin;

export type ResourceType = TextureType;

export enum TextureType {
    Image,
    SpriteSheet,
}

export abstract class Resource {

    public readonly Type: ResourceType;
    public readonly Id: string;
    public readonly Path: string;

    protected constructor(type: ResourceType, id: string, path: string) {
        this.Type = type;
        this.Id = id;
        this.Path = path;
    }

    /**
     * Custom loader function for this resource type
     */
    abstract Load(loader: LoaderPlugin): void;
}