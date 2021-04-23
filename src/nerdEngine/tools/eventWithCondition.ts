export class EventWithCondition {
    constructor(
        public readonly CheckCondition: () => boolean,
        public readonly OnConditionTrue: () => void) {}
}