import { StatScope } from "./statsScope";

export class KongStatValue {
    private readonly scope: StatScope;
    private value: number;
    constructor(scope: StatScope, value: number) {
        this.scope = scope;
        this.value = value;
    }

    get Scope(): StatScope {
        return this.scope;
    }

    get Value(): number {
        return this.value;
    }

    set Value(value: number) {
        this.value = value;
    }
}