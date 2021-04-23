import {IStorageItem} from "./IStorageItem";

export type ClassConstructor<T> = { new(... args: any[]): T };

export interface IStorage<T extends IStorageItem> {

    IsItemExists(id: string): boolean;
    GetItem(id: string): T;
    GetItems(id: string): T[];

    IsItemOfTypeExists<SubType extends T>(type: ClassConstructor<SubType>, id: string): boolean;
    GetItemOfType<SubType extends T>(type: ClassConstructor<SubType>, id: string): SubType;
    GetAllItemsOfType<TypeToSearch extends T>(constructor: { new(... args: any[]): TypeToSearch } ): TypeToSearch[];

    IsItemOfClassExists(classID: string, id: string): boolean;
    GetItemOfClass<SubType extends T>(classID: string, id: string): SubType;
    GetAllItemsOfClass<SubType extends T>(classID: string): SubType[];

    AddItem(item: T | T[]): void;

    GetAllItems(): T[];
}