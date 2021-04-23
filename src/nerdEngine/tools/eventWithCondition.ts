import { AsArray } from "../utils/utilsObjects";

export class EventWithCondition {
    constructor(
        public readonly CheckCondition: () => boolean,
        public readonly OnConditionTrue: () => void) {}
}

export class EventWithConditionManager {

    private items: EventWithCondition[] = [];

    constructor(events: EventWithCondition | EventWithCondition[] = []) {
        this.Add(events);
    }

    Add(events: EventWithCondition | EventWithCondition[]) {
        this.items.push(...AsArray(events));
    }

    /**
     * @return Number of completed events
     */
    Update(): number {
        let completed = 0;
        for (let i = 0; i < this.items.length; i++) {
            const condition = this.items[i];
            if (condition.CheckCondition()) {
                completed++;
                condition.OnConditionTrue();
                this.items.splice(i, 1)
            }
        }
        return completed;
    }
}