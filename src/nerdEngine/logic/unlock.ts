import {GameObject, ClassNames} from "./gameObject";
import {GameEvent} from "../components";
import {Exclude} from "class-transformer";
import { nerdEngine } from "../nerdEngine";

export type UnlockEventOnToggledArgs = {
    IsUnlocked: boolean,
    IsUnlockedBefore: boolean,
}

export type UnlockCondition = (unlock: Unlock) => boolean;

export type OnUnlockToggledEvent = (isUnlocked: boolean, isUnlockedBefore: boolean, unlock: Unlock) => void;

//todo короче, сделать класс Condition, и сделать ConditionalUnlock, которому ещё можно будет настроить автоапдейт
// это по сути класс достижений
export class Unlock extends GameObject {

    private unlocked: boolean;

    @Exclude()
    public readonly OnToggled: OnUnlockToggledEvent | undefined;

    @Exclude()
    public readonly Condition?: UnlockCondition;

    @Exclude()
    private readonly baseUnlocked: boolean;

    @Exclude()
    public readonly Events = {
        OnToggled: new GameEvent<Unlock, UnlockEventOnToggledArgs>(),
    }

    constructor(engine: nerdEngine | null, id: string, isUnlocked: boolean = false,
                onToggledEvent?: OnUnlockToggledEvent, condition?: UnlockCondition)
    {
        super(engine, ClassNames.Unlock, id);
        this.unlocked = isUnlocked;
        this.OnToggled = onToggledEvent;
        this.Condition = condition;

        this.baseUnlocked = this.unlocked;
    }

    Reset() {
        this.Toggle(this.baseUnlocked);
    }

    get IsUnlocked(): boolean {
        return this.unlocked;
    }

    Toggle(unlocked: boolean, throwExceptionIfAlreadySet: boolean = false) {
        if (this.unlocked == unlocked && throwExceptionIfAlreadySet) {
            throw new Error(`Unlock '${this.ID}' already set to '${unlocked}'`);
        }
        else {
            const isUnlockedBefore = this.unlocked;
            this.unlocked = unlocked;

            if (this.OnToggled) {
                this.OnToggled(unlocked, isUnlockedBefore, this);
            }

            this.Events.OnToggled.Trigger(this, {
                IsUnlocked: this.unlocked,
                IsUnlockedBefore: isUnlockedBefore
            })
        }
    }

    //todo можно сделать класс типо WalletTotalCollectedCondition
    /**
     * If condition is not set, it always return false
     * @param resetIfFalse Set to true to ignore current unlocked state and reset unlock to false even if it was unlocked before
     */
    CheckCondition(resetIfFalse: boolean = false) {
        let condition = false;

        if (this.Condition) condition = this.Condition(this);

        if (condition) {
            this.Toggle(true);
        }
        else if (resetIfFalse) {
            this.Toggle(false);
        }
    }

    InitFrom(engine: nerdEngine, oldUnlock: Unlock): void {
        this.Toggle(oldUnlock.unlocked);
    }
}