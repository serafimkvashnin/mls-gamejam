import {ClassNames, GameObject} from "../logic/gameObject";
import {Time} from "../data";
import {GetElapsedTimeMs} from "../utils/utilsMath";
import {GameData} from "../data";
import {DelayedAction} from "./delayedAction";
import {Exclude} from "class-transformer";
import { nerdEngine } from "../nerdEngine";

/**
 * @return Returns, is activation canceled or not
 */
export type ActionWithCooldownOnActivate = (sender: ActionWithCooldown) => boolean;
export type ActionWithCooldownCallback = (sender: ActionWithCooldown) => void;

//todo СДЕЛАТЬ ОПЦИЮ, типо, работает ли релоад когда игра выключена. Сейчас будет по дефолту тру,
// но потом было бы неплохо таки заимпелементить это (нужно будет как-то сохранять прогресс релоада или типо того)

export class ActionWithCooldown extends GameObject {

    @Exclude()
    public readonly OnActivate: ActionWithCooldownOnActivate;

    @Exclude()
    public readonly OnReloadCallback?: ActionWithCooldownCallback;

    @Exclude()
    private reloadingAction: DelayedAction | null;

    @Exclude()
    public CooldownMs: GameData;

    private isReloading: boolean;
    private reloadingStarted: Date | null;

    @Exclude()
    private isReady: boolean;

    @Exclude()
    public IsAutoReloading: boolean;

    constructor(engine: nerdEngine | null, id: string,
                isReady: boolean, cooldown: Time | number, onActivate: ActionWithCooldownOnActivate,
                onReloaded?: ActionWithCooldownCallback, autoReload: boolean = true)
    {
        super(engine, ClassNames.ActionWithCooldown, id);
        this.isReloading = false;
        this.reloadingStarted = null;
        this.reloadingAction = null;

        this.isReady = isReady;
        this.CooldownMs = new GameData("Cooldown", typeof cooldown == "number" ? cooldown : cooldown?.TotalMs ?? 0);
        this.IsAutoReloading = autoReload;

        this.OnReloadCallback = onReloaded;
        this.OnActivate = onActivate;
    }

    get IsReloading() {
        return this.isReloading;
    }

    get Cooldown(): Time {
        return Time.FromMs(this.CooldownMs.Value);
    }

    get IsReady() {
        return this.isReady;
    }

    get ReloadingStartedOn(): Date | null {
        return this.reloadingStarted;
    }

    get ElapsedMs(): number | null {
        if (this.isReloading) {
            return GetElapsedTimeMs(this.CooldownMs.Value.AsNumber, this.reloadingStarted!);
        }
        else return null;
    }

    /**
     * @param throwErrorIfNotReady
     * @return Is activation canceled or not. If not ready, returns null;
     */
    Activate(throwErrorIfNotReady: boolean = false): boolean | null {
        if (this.isReady) {
            this.isReady = false;

            const isCanceled = this.OnActivate(this);
            //const isCanceled = typeof result == "undefined" ? false : result;

            if (!isCanceled && this.IsAutoReloading) {
                this.StartReloading();
            }

            return isCanceled;
        }
        else {
            if (throwErrorIfNotReady) {
                throw new Error(`ActionWithCooldown '${this.ID}' is not ready!`);
            }
            return null;
        }
    }

    StartReloading(date?: Date, restartIfAlreadyReloading: boolean = false) {
        let DoReload = () => {
            this.reloadingStarted = date ? date : new Date();
            this.isReloading = true;

            this.reloadingAction = new DelayedAction(null, this.ElapsedMs!, true, () => {
                const awc = this
                console.log('Reloading finished!');
                awc.OnReloaded();
            })
        }

        if (this.isReloading) {
            if (restartIfAlreadyReloading) {
                DoReload();
            }
            else {
                throw new Error(`ActionWithCooldown '${this.ID}' is already reloading!`);
            }
        }
        else {
            DoReload();
        }
    }

    private OnReloaded() {
        if (this.OnReloadCallback) {
            this.OnReloadCallback(this);
        }

        if (this.isReloading) {
            this.isReloading = false;
            this.reloadingAction = null;
            this.reloadingStarted = null;
            this.isReady = true;
        }
        else {
            throw new Error(`OnReload called, but ActionWithCooldown '${this.ID}' is not reloading!`);
        }
    }

    InitFrom(engine: nerdEngine, item: ActionWithCooldown): void {
        //throw new Error('Not implemented');

        if (item.isReloading) {
            if (item.reloadingStarted) {
                this.isReady = false;
                this.StartReloading(item.reloadingStarted);
            }
            else {
                console.log(`[LOAD ERROR!] IsReloading == true, but ReloadingStarted value is not provided`);
            }
        }
    }
}