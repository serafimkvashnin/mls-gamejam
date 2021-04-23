export interface IDataManager {
    SetItem(name: string, data: string): Promise<void>;
    GetItem(name: string): Promise<string | null>;
    RemoveItem(name: string): Promise<void>;
    Clear(): Promise<void>;
}