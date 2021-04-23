import { Engine, MersenneTwister19937, Random } from "random-js";
import { ISaveMaker, LoadedContentFixer, LoadManager, SaveMaker, StopWatchManager } from "./managers";
import { Wallet } from "./logic/wallet";
import {
    Container,
    Idler, IGameObject,
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
import { Price, PriceArray } from "./logic/price";
import { GameEvent } from "./components";
import { ContentModule } from "./content";
import { IUpdate } from "./interfaces";
import { ValuesOf } from "./utils/utilsObjects";
import { SystemManager } from "./managers/systemManager";
import { IDataManager } from "./interfaces/IDataManager";
import { SaveManager } from "./managers/saveSystem";
import { Exclude } from "class-transformer";
import { DataManager } from "./managers/dataManager";

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
    dataManager?: IDataManager,
    saveMaker?: (engine: nerdEngine) => ISaveMaker,
    loadManager?: (engine: nerdEngine) => LoadManager,
    restartToLoad?: (loadManger: LoadManager) => void,
    platform?: GamePlatform,
    random?: Engine,

    contentInitCallback?: () => void,
    contentResetCallback?: () => void,

    contentFixer?: (engine: nerdEngine) => LoadedContentFixer,
    customTypes?: () => { [id: string]: ClassConstructor<any> }
}

export interface INerdEngine {
    Reset(): void;
}

export class nerdEngine implements INerdEngine {

    @Exclude()
    public readonly Events: {
        OnContentStartedLoading: GameEvent<nerdEngine, {}>,
        OnContentLoaded: GameEvent<nerdEngine, {}>,
        OnContentUnloaded: GameEvent<nerdEngine, {}>,

        //todo REFACTOR
        //OnThemesInitiated: GameEvent<nerdEngine, {}>,
    }

    public readonly EngineVersion = "1.1";

    public readonly BUILD_MODE: GameBuildMode;

    public readonly GameName: string;
    public readonly GameVersion: string;

    private system: SystemManager;
    public readonly Random: Random;
    public readonly Platform: GamePlatform;
    public readonly Loading: LoadManager;
    public readonly Saving: SaveManager;
    public readonly Stopwatches: StopWatchManager;
    public readonly Data: IDataManager;
    public readonly GetCustomTypes?: () => { [id: string]: ClassConstructor<any> };

    private readonly contentInitCallback?: () => void;
    private readonly contentResetCallback?: () => void;

    public readonly Storage: {
        readonly Modules: ObjectStorage<ContentModule<any>>,
        readonly GameObjects: ObjectStorage<IGameObject>,
        readonly UpdateList: ObjectStorage<IStorageItem & IUpdate>,
    }

    constructor(config: nerdEngineConfig) {
        this.BUILD_MODE = config.buildMode;

        this.GameName = config.gameName;
        this.GameVersion = config.gameVersion ?? "1.0.0";

        this.Data = config.dataManager ?? new DataManager();
        this.system = new SystemManager(this);
        this.Stopwatches = new StopWatchManager(this);
        this.Loading = config.loadManager
            ? config.loadManager(this)
            : new LoadManager(this, config.contentFixer ? config.contentFixer(this) : undefined);
        this.Loading.restartToLoadCallback = config.restartToLoad ?? undefined;

        this.Platform = config.platform ?? "None";
        this.Saving = new SaveManager(this, config.saveMaker ? config.saveMaker(this) : new SaveMaker(this));
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

        //todo я же правильно понимаю, что мне надо тут сбрасывать евенты?
        // просто пока не понятно что будет статическим а что нет.
        // объект движка я всё таки планировал сделать статическим
        this.Events = {
            OnContentStartedLoading: new GameEvent<nerdEngine, {}>(),
            OnContentLoaded: new GameEvent<nerdEngine, { }>(),
            OnContentUnloaded: new GameEvent<nerdEngine, { }>(),
            //OnThemesInitiated: new GameEvent<nerdEngine, { }>()
        }

        console.log(`[nerdEngine] Engine instance of version ${this.EngineVersion} is live!`);
    }

    get System() {
        return this.system;
    }

    Reset() {
        //todo вот это полная поебистика. это надо исправлять
        for (const event of [
            ...ValuesOf(this.Events),
            ...ValuesOf(this.Loading.Events),
            ...ValuesOf(this.System.Events),

        ]) {
            event.ClearObservers();
        }

        this.Loading.CustomLoadHandlers.PlainToClassStage = [];
        this.Loading.CustomLoadHandlers.InitFromStage = [];
        this.Loading.CustomLoadHandlers.OptionalActionsStage = [];

        this.ClearStorage();
        this.system = new SystemManager(this);
        console.log(`[nerdEngine] Reset completed!`);
    }

    /**
     * Use this to call custom defined contentInitCallback. IT DOESN'T CALL OnContentLoaded EVENT!
     */
    InitContent() {
        if (this.contentInitCallback) {
            this.contentInitCallback();
        }
    }

    /**
     * Don't use this yourself. Used by LoadManager to ResetContent before LoadGame action
     */
    ResetContent() {
        //todo make this private for LoadManager? To doesn't allow user to call it
        if (this.contentResetCallback) {
            this.contentResetCallback();
        }
    }

    LoadModules() {
        for (const module of this.Storage.Modules.Items) {
            module.Get();
        }
        console.log(`[nerdEngine] Loaded ${this.Storage.Modules.Items.length} modules`);
    }

    /**
     * Calls events (started/finished), and does some engine stuff. REQUIRED
     */
    OnContentLoaded() {
        console.log(`[nerdEngine::OnContentLoaded] Started`);
        this.Stopwatches.Toggle("OnContentLoaded")

        // //todo может сделать более универсальный GameID/SessionID?
        // if (loadID != Game.Loading.LoadID) {
        //     console.log(`LoadID is outdated (another game init happened). Canceling OnGameFullyLoaded event`);
        //     return;
        // }

        if (this.System.IsGameCrashed) {
            console.log(`An error occurred. Canceling OnGameFullyLoaded event`);
            return;
        }

        this.Events.OnContentStartedLoading.Trigger(this, {});

        this.Stopwatches.Toggle("OnContentLoaded")
        this.System.IsContentLoaded = true;

        this.Events.OnContentLoaded.Trigger(this, {});
        console.log(`[Event::OnContentLoaded] Triggered for ${this.Events.OnContentLoaded.Observers.length} observers`);

        console.log(`[nerdEngine::OnContentLoaded] Finished`);
    }

    ClearStorage() {
        this.Storage.GameObjects.Clear();
        this.Storage.Modules.Clear();
        this.Storage.UpdateList.Clear();
    }

    //todo +++ Встроить тесты в движок

    //todo рефакторить (пока хз как)
    // async DoTests(): Promise<number> {
    //     const testsCount = await StartTesting();
    //     console.log(`All ${testsCount} tests completed!`);
    //     return testsCount;
    // }

    GetTypeList() {
        let types = {
            // Logic
            "GameFloat": GameFloat,
            "Container": Container,
            "Idler": Idler,
            "Points": Points,
            "Price": Price,
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