import { IDataManager } from "../interfaces/IDataManager";

export class DataManager implements IDataManager {
    constructor() {

    }

    async GetItem(name: string): Promise<string | null> {
        return localStorage.getItem(name);
    }

    async SetItem(name: string, data: string): Promise<void> {
        await localStorage.setItem(name, data)
    }

    async Clear(): Promise<void> {
        localStorage.clear();
    }

    async RemoveItem(name: string): Promise<void> {
        await localStorage.removeItem(name);
    }
}