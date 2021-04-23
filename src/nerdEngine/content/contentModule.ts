import {ObjectStorage} from "../data/objectStorage";
import {Unlock} from "../logic";
import {UnlockUpgrade} from "../logic/upgrade";
import { nerdEngine } from "../nerdEngine";
import { Exclude } from "class-transformer";
import { GameEvent } from "../components";

@Exclude()
export class ContentModule<T> {
    public readonly Events = {
        OnLoaded: new GameEvent<ContentModule<T>, { content: T }>()
    }

    public readonly ModuleStorage: ObjectStorage<ContentModule<any>>

    private isLoaded: boolean = false;
    private content: T | null;
    public readonly ID: string;
    public readonly ClassID: string = "Module";
    private readonly LoadContent: () => T;

    constructor(engine: nerdEngine, id: string, load: () => T, autoAdd: boolean = true)
    {
        this.ModuleStorage = engine.Storage.Modules;
        this.ID = id;
        this.LoadContent = load;

        this.content = null;

        if (autoAdd) {
            engine.Storage.Modules.AddItem(this);
        }
    }

    GetModule(id: string): ContentModule<any> {
        for (const module of this.ModuleStorage.Items) {
            if (module.ID == id) {
                return module;
            }
        }

        throw new Error(`Module not found: '${id}'`);
    }

    GetContent<ContentType>(id: string): ContentType {
        return this.GetModule(id).Get();
    }

    get IsLoaded(): boolean {
        return this.isLoaded;
    }

    get Content(): T {
        return this.Get();
    }

    Load(): void {
        if (this.IsLoaded && !this.content)
            throw new Error(`Module '${this.ID}' flagged loaded, but content is null.`
                + `\nMost likely it's circular reference.`);

        if (!this.IsLoaded) {
            this.isLoaded = true;
            this.content = this.LoadContent();

            this.Events.OnLoaded.Trigger(this, { content: this.content });

            if (!this.content) throw new Error(`Module '${this.ID}': LoadContent() returned null`);
         }
    }

    Get(): T {
        this.Load();
        return this.content!;
    }
}

export type TestUnlocks = {
    TestUnlock: Unlock;
}

export type TestUpgrades = {
    TestUnlockUpgrade: UnlockUpgrade;
}