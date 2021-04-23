//todo add position in rating and system to get position progress
import { KongStatValue } from "./kongStatValue";
import { StatScope } from "./statsScope";

export class KongStat {
    private readonly id: string;
    private readonly name: string;
    private readonly values: KongStatValue[];

    constructor(id: string, name: string, values: KongStatValue[]) {
        this.id = id;
        this.name = name;
        this.values = values;
    }

    get ID(): string {
        return this.id;
    }

    get Name(): string {
        return this.name;
    }

    get Values() {
        return this.values;
    }

    HasScopeValue(scope: StatScope): boolean {
        try {
            this.GetValue(scope);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    GetValue(scope: StatScope): KongStatValue {
        for (const statValue of this.values) {
            if (statValue.Scope == scope) {
                return statValue;
            }
        }

        throw new Error(`Value with scope: ${scope} was not found!`);
    }

    AddValue(statValue: KongStatValue, update: boolean = true) {
        if (this.HasScopeValue(statValue.Scope)) {
            if (update) {
                const currentStatValue = this.GetValue(statValue.Scope);
                currentStatValue.Value = statValue.Value;
            }
            else {
                throw new Error(`Scope already exists: ${statValue.Scope}`);
            }
        }
        else {
            this.values.push(statValue);
        }
    }

    AddValues(statValues: KongStatValue[], update: boolean = true) {
        for (const statValue of statValues) {
            this.AddValue(statValue, update);
        }
    }
}