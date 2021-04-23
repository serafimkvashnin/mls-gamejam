// import { Content } from "../../content/content";
import { GameEvent } from "../components";
import { nerdEngine } from "../nerdEngine";
import { Exclude } from "class-transformer";

export type CrashInfo = {
    error?: Error,
    message?: string,
}

export class SystemManager {

    @Exclude()
    public readonly Events = {
        IsCrashedStateChanged: new GameEvent<SystemManager, { isCrashed: boolean, crashInfo?: CrashInfo }>(),
        IsContentLoadedStateChanged: new GameEvent<SystemManager, { isLoaded: boolean }>(),
    }

    private isGameCrashed: boolean;
    private isContentLoaded: boolean; //todo move to nerdEngine? (or ContentManager)
    public IsCanAccessThemes: boolean; //todo move to nerdEngineC3

    public IsAutoSaveEnabledC3: boolean; //todo move to C3 manager

    //todo REFACTOR! MOVE TO OVERLAY MESSAGE MANAGER
    /* Note: If there is some overlay, all  */
    public IsShowingOverlay = false;
    public CurrentOverlay = {
        Theme: "", //OverlayMessage
        InputTheme: "" //OverlayMessageButton
    };

    public readonly Settings = {
        PerformanceStopwatches: false,
        ShowNotifications: true,
        ShowMonsterAward: true,
        ShowDevInfo: true,
        SpawnParticles: true,
        GetOfflineEarnings: true,
        ShowRefundLogs: true,
    };

    public readonly Debug = {
        Bot: {
            Enabled: false,
            Toggle: (enabled: boolean) => {

                //todo refactor
                // Content.Timers.Debug.Bot.Toggle(enabled);
                this.Debug.Bot.Enabled = enabled;
            }
        }
    }

    public readonly PerformanceStats = {
        ToggleThemeCalls: 0,
    }

    constructor(public readonly Engine: nerdEngine) {
        this.IsAutoSaveEnabledC3 = false;
        this.isContentLoaded = false;
        this.isGameCrashed = false;
        this.IsCanAccessThemes = false;
    }

    //todo можно сделать универсальную систему хранения статических данных (Хотя я думаю лучше для этого сделать отдельный класс)
    //SetStaticRecord<T>(id: string, value: T)

    get IsGameCrashed() {
        return this.isGameCrashed;
    }

    private lastCrashInfo?: CrashInfo;

    OnGameCrashed(crashInfo: CrashInfo) {
        this.lastCrashInfo = crashInfo;
        this.IsGameCrashed = true;

        this.lastCrashInfo = undefined;
    }

    set IsGameCrashed(value) {
        if (value) {
            if (!this.isGameCrashed) {
                this.isGameCrashed = true;
                this.isContentLoaded = false;
                this.IsCanAccessThemes = false;
            }
            else {
                throw new Error(`Game is already crashed!`);
            }
        }
        else {
            if (this.isGameCrashed) {
                this.isGameCrashed = false;
            }
            else {
                throw new Error(`Game is already not crashed!`);
            }
        }

        this.Events.IsCrashedStateChanged.Trigger(this, {
            isCrashed: this.isGameCrashed,
            crashInfo: this.lastCrashInfo
        });
    }

    get IsContentLoaded() {
        return this.isContentLoaded;
    }

    //todo мне кажется нужно убрать нахуй isThemesInitiated (а, ну точнее перенести его в nerdEngineC3 и не засорять им движок)

    set IsContentLoaded(value) {
        if (value) {
            if (!this.isContentLoaded) {
                this.isContentLoaded = true;
            } else {
                /*throw new Error*/console.log(`Content is already loaded!`);
            }
        } else {
            if (this.isContentLoaded) {
                this.isContentLoaded = false;
            } else {
                /*throw new Error*/console.log(`Content is already not loaded!`);
            }
        }

        this.Events.IsContentLoadedStateChanged.Trigger(this, {isLoaded: this.isContentLoaded});

        // if (this.isContentLoaded) {
        //     this.Engine.Events.OnContentLoaded.Trigger(this.Engine, {LoadID: this.Engine.Loading.LoadID});
        // }
    }
}