import { GameEvent } from "../components";
import { nerdEngine } from "../nerdEngine";
import { Exclude } from "class-transformer";
import { Time } from "../data";
import { LogColored } from "../utils/utilsText";

export type CrashInfo = {
    error?: Error,
    message?: string,
}

@Exclude()
export class SystemManager {
    public readonly Events = {
        IsCrashedStateChanged: new GameEvent<SystemManager, { isCrashed: boolean, crashInfo?: CrashInfo }>(),
        IsContentLoadedStateChanged: new GameEvent<SystemManager, { isLoaded: boolean }>(),
    }

    private isGameCrashed: boolean;
    private isContentLoaded: boolean; //todo move to nerdEngine? (or ContentManager)
    public IsAutoSaveEnabledC3: boolean; //todo move to C3 manager

    //todo Сделать универсальную систему оверлеев, и чтобы notification-ы были просто частным случаем
    /* Note: If there is some overlay, all  */
    public IsShowingOverlay = false;
    public CurrentOverlay = {
        Theme: "", //OverlayMessage
        InputTheme: "" //OverlayMessageButton
    };

    //todo more debug/log settings for Engine?
    public readonly Settings = {
        PerformanceStopwatches: false, //todo refactor it to set it through engine config
    }

    public readonly PerformanceStats = {
        SomethingTotalDuration: new Time(),
        ToggleThemeCalls: 0,
    }

    constructor(public readonly Engine: nerdEngine) {
        this.IsAutoSaveEnabledC3 = false;
        this.isContentLoaded = false;
        this.isGameCrashed = false;
    }

    //todo можно сделать универсальную систему хранения статических данных (Хотя я думаю лучше для этого сделать отдельный класс)
    //SetStaticRecord<T>(id: string, value: T)

    get IsGameCrashed() {
        return this.isGameCrashed;
    }

    private lastCrashInfo?: CrashInfo;

    /**
     * If you want to change crash info, without triggering event (e.g. for custom error handling), pass false to triggerEvent
     */
    SetGameCrashed(isCrashed: boolean, crashInfo?: CrashInfo, triggerEvent = true) {
        this.lastCrashInfo = crashInfo;
        this.OnCrashedStateChanged(isCrashed, triggerEvent);

        this.lastCrashInfo = undefined;
    }

    private OnCrashedStateChanged(value: boolean, triggerEvent: boolean) {
        if (value) {
            if (!this.isGameCrashed) {
                this.isGameCrashed = true;
                this.isContentLoaded = false;
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

        if (triggerEvent) {
            this.Events.IsCrashedStateChanged.Trigger(this, {
                isCrashed: this.isGameCrashed,
                crashInfo: this.lastCrashInfo
            });
        }
    }

    get IsContentLoaded() {
        return this.isContentLoaded;
    }

    set IsContentLoaded(value) {
        if (value) {
            if (!this.isContentLoaded) {
            }
            else {
                //throw new Error(`Content is already loaded!`);
                LogColored(`Content is already loaded!`, '#ff5555');
            }
            this.isContentLoaded = true;
        }
        else {
            if (this.isContentLoaded) {

            }
            else {
                //throw new Error(`Content is already not loaded!`);
                LogColored(`Content is already not loaded!`, '#ff5555');
            }

            this.isContentLoaded = false;
        }

        this.Events.IsContentLoadedStateChanged.Trigger(this, {isLoaded: this.isContentLoaded});

        // if (this.isContentLoaded) {
        //     this.Engine.Events.OnContentLoaded.Trigger(this.Engine, {LoadID: this.Engine.Loading.LoadID});
        // }
    }
}