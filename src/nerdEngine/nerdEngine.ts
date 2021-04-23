import { Engine, MersenneTwister19937, Random } from "random-js";
import { ISaveMaker, LoadedContentFixer, LoadManager, StopWatchManager } from "./managers";
import { Wallet } from "./logic/wallet";
import {
    Container,
    IGameObject,
    Points,
    Setting,
    Stat,
    Timer,
    Tweak, TweakArray,
    Unlock,
} from "./logic";
import { Upgrade } from "./logic/upgrade";
import { ClassConstructor, IStorageItem, ObjectStorage, Time } from "./data";
import { GameFloat } from "./data";
import { ActionWithCooldown } from "./tools";
import { CustomPrice, Price, PriceArray } from "./logic/price";
import { GameEvent } from "./components";
import { ContentModule } from "./content";
import { IUpdate } from "./interfaces";
import { SystemManager } from "./managers/systemManager";
import { IDataManager } from "./interfaces/IDataManager";
import { SaveManager } from "./managers/saveSystem";
import { Exclude } from "class-transformer";
import { LogColored } from "./utils/utilsText";

// export interface IEngineComponent {
//     Create(engine: nerdEngine/*, ...args: any[]*/): this;
// }

export type GamePlatform = "None" | "Kongregate" | "CrazyGames" | "Itch" | "ArmorGames";
export type GameBuildMode = "Preview" | "Release";

//todo сделать конфиг для saveManager и передевать его через конфиг движка?
export type nerdEngineConfig = {
    gameName: string,
    gameVersion?: string,
    buildMode: GameBuildMode,
    fileSystem: IDataManager,
    saveMaker: (engine: nerdEngine) => ISaveMaker,
    loadManager?: (engine: nerdEngine, contentFixer?: LoadedContentFixer) => LoadManager,
    platform?: GamePlatform,
    random?: Engine,

    contentInitCallback: () => void,
    contentResetCallback: () => void,

    contentFixer?: (engine: nerdEngine) => LoadedContentFixer,
    customTypes: () => { [id: string]: ClassConstructor<any> }
}

// export interface INerdEngine {
//     Init(): void;
// }

export class nerdEngine {

    @Exclude()
    public readonly Events = {
        OnContentStartedLoading: new GameEvent<nerdEngine, {}>(),
        OnContentLoaded: new GameEvent<nerdEngine, { }>(),
        OnContentUnloaded: new GameEvent<nerdEngine, { }>(),
        //OnThemesInitiated: new GameEvent<nerdEngine, { }>()
    }

    public readonly EngineVersion = "1.0";

    public readonly BUILD_MODE: GameBuildMode;

    public readonly GameName: string;
    public readonly GameVersion: string;

    //todo подумать над более умной системой (сделать отдельный тип/класс и настраивать разные типы вывода)
    public readonly DoLogs: boolean;

    private system: SystemManager;
    public readonly Random: Random;
    public readonly Platform: GamePlatform;
    public readonly Loading: LoadManager;
    public readonly Saving: SaveManager;
    //public readonly Stopwatches: StopWatchManager;
    public readonly Data: IDataManager;
    public readonly GetCustomTypes?: () => { [id: string]: ClassConstructor<any> };

    private readonly contentInitCallback: () => void;
    private readonly contentResetCallback: () => void;

    public readonly Storage: {
        readonly Modules: ObjectStorage<ContentModule<any>>,
        readonly GameObjects: ObjectStorage<IGameObject>,
        readonly UpdateList: ObjectStorage<IStorageItem & IUpdate>,
    }

    constructor(config: nerdEngineConfig) {
        this.DoLogs = false; //todo: TEMP
        this.BUILD_MODE = config.buildMode;

        //todo я же правильно понимаю, что мне надо тут сбрасывать евенты?
        // просто пока не понятно что будет статическим а что нет.
        // объект движка я всё таки планировал сделать статическим
        // this.Events = {
        //     OnContentStartedLoading: new GameEvent<nerdEngine, {}>(),
        //     OnContentLoaded: new GameEvent<nerdEngine, { }>(),
        //     OnContentUnloaded: new GameEvent<nerdEngine, { }>(),
        //     //OnThemesInitiated: new GameEvent<nerdEngine, { }>()
        // }

        this.GameName = config.gameName;
        this.GameVersion = config.gameVersion ?? "1.0.0";

        this.Data = config.fileSystem;
        this.system = new SystemManager(this);
        //this.Stopwatches = new StopWatchManager(this);

        let contentFixer = config.contentFixer ? config.contentFixer(this) : undefined;
        this.Loading = config.loadManager
            ? config.loadManager(this, contentFixer)
            : new LoadManager(this, contentFixer);

        this.Platform = config.platform ?? "None";
        this.Saving = new SaveManager(this, config.saveMaker(this));
        this.GetCustomTypes = config.customTypes;

        const randomEngine = config.random ?? MersenneTwister19937.autoSeed();
        this.Random = new Random(randomEngine);

        this.contentInitCallback = config.contentInitCallback;
        this.contentResetCallback = config.contentResetCallback;

        this.Storage = {
            GameObjects: new ObjectStorage<IGameObject>(),
            UpdateList: new ObjectStorage<IStorageItem&IUpdate>(),
            Modules: new ObjectStorage<ContentModule<any>>(),
        }
    }

    get System() {
        return this.system;
    }

    /**
     * Use this to call custom defined contentInitCallback. IT DOESN'T CALL OnContentLoaded EVENT!
     */
    InitContent() {
        this.contentInitCallback();
    }

    /**
     * Don't use this yourself. Used by LoadManager to ResetContent before LoadGame action
     */
    ResetContent() {
        //todo make this private for LoadManager? To doesn't allow user to call it
        this.contentResetCallback();
    }

    LoadModules() {
        for (const module of this.Storage.Modules.Items) {
            module.Get();
        }
        if (this.DoLogs) console.log(`[nerdEngine] Loaded ${this.Storage.Modules.Items.length} modules`);
    }

    /**
     * Calls events (started/finished), and does some engine stuff. REQUIRED
     */
    OnContentLoaded() {
        if (this.DoLogs) console.log(`[nerdEngine::OnContentLoaded] Started`);

        if (this.System.IsGameCrashed) {
            if (this.DoLogs) console.log(`An error occurred. Canceling OnGameFullyLoaded event`);
            return;
        }

        this.Events.OnContentStartedLoading.Trigger(this, {});

        this.System.IsContentLoaded = true;

        this.Events.OnContentLoaded.Trigger(this, {});

        //LogColored(`Some total duration: ${GetTimeText(this.System.PerformanceStats.SomethingTotalDuration)} (${this.System.PerformanceStats.SomethingTotalDuration.TotalMs.AsNumber})`, "#5ae253")
        if (this.DoLogs) console.log(`[Event::OnContentLoaded] Triggered for ${this.Events.OnContentLoaded.Observers.length} observers`);

        if (this.DoLogs) console.log(`[nerdEngine::OnContentLoaded] Finished`);
    }

    /**
     * This method is automatically called in InitMethod
     * @constructor
     */
    ClearStorage() {
        this.Storage.GameObjects.Clear();
        this.Storage.Modules.Clear();
        this.Storage.UpdateList.Clear();
    }

    GetTypeList() {
        let types = {
            // Logic
            "GameFloat": GameFloat,
            "Container": Container,
            "Points": Points,
            "Price": Price,
            "CustomPrice": CustomPrice,
            "PriceArray": PriceArray,
            "Tweak": Tweak,
            "TweakArray": TweakArray,
            "Setting": Setting,
            "Stat": Stat,
            "Timer": Timer,
            "Upgrade": Upgrade,
            "Wallet": Wallet,
            "Unlock": Unlock,
            // "UnlockUpgrade": UnlockUpgrade,

            // Data
            "Time": Time,

            // Utilities
            "ActionWithCooldown": ActionWithCooldown,
        };

        if (this.GetCustomTypes) {
            types = Object.assign(types, this.GetCustomTypes());
        }

        return types;
    }
}