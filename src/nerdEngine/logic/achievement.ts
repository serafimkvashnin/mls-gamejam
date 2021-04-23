import {ClassNames, GameObject} from "./gameObject";
import { nerdEngine } from "../nerdEngine";

export type AchievementCondition = () => boolean;
export type AchievementOnUnlocked = (sender: Achievement) => void;

export class Achievement extends GameObject{

    public readonly Condition: AchievementCondition;
    public readonly OnUnlocked?: AchievementOnUnlocked;
    private isUnlocked: boolean;

    constructor(engine: nerdEngine | null, id: string,
                condition: AchievementCondition, onUnlocked?: AchievementOnUnlocked)
    {
        super(engine, ClassNames.Achievement, id);

        this.isUnlocked = false;
        this.Condition = condition;
        this.OnUnlocked = onUnlocked;
    }

    get IsUnlocked() {
        return this.isUnlocked;
    }

    private Unlock() {
        if (!this.isUnlocked && this.Condition()) {
            this.isUnlocked = true;
            if (this.OnUnlocked) this.OnUnlocked(this);
        }
    }

    Update(): boolean {
        if (this.Condition()) {
            this.Unlock();
            return true;
        }
        else {
            return false;
        }
    }

    InitFrom(engine: nerdEngine, item: Achievement): void {
        throw new Error("Not implemented");
    }
}