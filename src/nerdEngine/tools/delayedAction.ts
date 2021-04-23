import {Time} from "../data";
import {LoadManager} from "../managers";
import {Exclude} from "class-transformer";

export type DelayedActionCallback = (canceled: boolean) => void;

export class DelayedAction {

    private callbackID: number = 0;
    private started: boolean;
    private canceled: boolean;

    @Exclude()
    private readonly callback: DelayedActionCallback;

    private _duration: Time;
    public readonly DontCallIfCanceled: boolean;

    @Exclude()
    public readonly SaveManager: LoadManager | null;

    constructor(saveManager: LoadManager | null, duration: Time | number, autostart: boolean, callback: DelayedActionCallback, dontCallIfCanceled: boolean = false) {
        this.SaveManager = saveManager;
        this.started = false;
        this.canceled = false;

        this._duration = typeof duration == "number" ? Time.FromMs(duration) : duration;
        this.callback = callback;
        this.DontCallIfCanceled = dontCallIfCanceled;

        if (autostart) {
            this.Start();
        }
    }

    get Duration() {
        return this._duration;
    }

    get IsStarted() {
        return this.started;
    }

    get IsCanceled() {
        return this.canceled;
    }

    Start(restart: boolean = false, newDurationMs?: Time | number) {
        if (newDurationMs) {
            this._duration = typeof newDurationMs == "number" ? Time.FromMs(newDurationMs) : newDurationMs;
        }
        if (this.started) {
            if (restart) {
                this.StartCallback();
                console.log(`UI Update restarted`);
            }
        }
        else {
            this.StartCallback();
        }
    }

    /**
     * 'canceled' flag is ignored
     */
    DoRightNow() {
        this.callback(false);
    }

    Cancel() {
        this.canceled = true;
    }

    private StartCallback() {
        if (this.callbackID < 100) {
            this.callbackID++;
        }
        else {
            this.callbackID = 0;
        }

        const savedCallbackID = this.callbackID;
        const savedLoadID = this.SaveManager?.LoadID ?? 0;

        setTimeout(() => {
            let delayedAction = this;

            const loadID = savedLoadID;
            const currentLoadID = delayedAction.SaveManager?.LoadID ?? 0;
            if (loadID != currentLoadID) {
                console.log(`[DelayedAction] LoadID changed, skipping callback`);
                return;
            }

            const callbackID = savedCallbackID;
            this.started = false;

            if (delayedAction.canceled && this.DontCallIfCanceled) return;

            if (delayedAction.callbackID != callbackID) {
                //console.log(`Callback id changed, callback canceled`);
                return;
            }

            delayedAction.callback(delayedAction.canceled);
            this.canceled = false;

        }, this._duration.TotalMs.AsNumber);
    }
}