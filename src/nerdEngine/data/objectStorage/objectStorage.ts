import {ClassConstructor, IStorage} from "./IStorage";
import {IStorageItem} from "./IStorageItem";
import { AsArray } from "../../utils/utilsObjects";

export class ObjectStorage<StorageItemType extends IStorageItem> implements IStorage<StorageItemType> {
    private items: StorageItemType[];

    //todo AllowSameNameAll, and AllowSameNameWithSameType
    public readonly AllowSameName: boolean;

    constructor(items?: StorageItemType[], allowSameName: boolean = false) {
        this.AllowSameName = allowSameName;

        if (items) {
            this.items = items;
        }
        else {
            this.items = [];
        }
    }

    get Length(): number {
        return this.items.length;
    }

    GetItem<GetItemType extends StorageItemType>(id: string): GetItemType {
        for (const item of this.items) {
            if (item.ID === id) {
                return item as GetItemType;
            }
        }

        throw new Error(`Item not found: ${id}`);
    }

    GetItems<GetItemType extends StorageItemType>(id: string): GetItemType[] {
        let items: GetItemType[] = [];
        for (const item of this.items) {
            if (item.ID === id) {
                items.push(item as GetItemType);
            }
        }

        if (items.length != 0) {
            return items;
        }
        else {
            throw new Error(`Items not found: ${id}`);
        }
    }

    GetItemOfType<GetItemType extends StorageItemType>(type: ClassConstructor<GetItemType>, id: string): GetItemType {
        const items = this.GetAllItemsOfType(type);
        for (const item of items) {
            if (item.ID == id) {
                return item;
            }
        }

        throw new Error(`Item of type ${type.name} not found: ${id}`);
    }

    GetAllItemsOfType<GetItemType extends StorageItemType>(type: ClassConstructor<GetItemType>): GetItemType[] {
        const items: GetItemType[] = [];
        for (const item of this.items) {
            if (item instanceof type) {
                items.push(item);
            }
        }
        if (items) {
            return items;
        }
        else throw new Error(`Items of type ${type.name} not found`);
    }

    GetItemOfClass<T extends StorageItemType>(classID: string, id: string): T {
        const items = this.GetAllItemsOfClass(classID);
        for (const item of items) {
            if (item.ID == id) {
                return item as T;
            }
        }

        throw new Error(`Item of type ${classID} and id ${id} not found`);
    }

    GetAllItemsOfClass<T extends StorageItemType>(classID: string) {
        let items: T[] = [];
        for (const item of this.items) {
            if (item.ClassID === classID) {
                items.push(item as T);
            }
        }

        if (items.length != 0) {
            return items;
        }
        else {
            throw new Error(`Item of class not found: ${classID}`);
        }
    }

    GetAllItems(): StorageItemType[] {
        return this.items;
    }

    get Items(): StorageItemType[] {
        return this.GetAllItems();
    }

    IsItemExists(id: string): boolean {
        try {
            this.GetItem(id);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    IsItemOfTypeExists<T extends StorageItemType>(type: ClassConstructor<T>, id: string): boolean {
        try {
            this.GetItemOfType(type, id);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    IsItemOfClassExists(classID: string, id: string): boolean {
        try {
            this.GetItemOfClass(classID, id);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    AddItem(items: StorageItemType | StorageItemType[]): void {
        items = AsArray(items);
        for (const item of items) {
            if (this.AllowSameName || !this.IsItemExists(item.ID)) {
                this.items.push(item);
            } else {
                throw new Error(`Item already exists: ${item.ID}`);
            }
        }
    }

    RemoveItem(id: string, errorIfNotFound: boolean = true) {
        for (let i = 0; i < this.Items.length; i++) {
            const item = this.Items[i];

            if (item.ID == id) {
                this.items.splice(i, 1);
                return;
            }
        }

        if (errorIfNotFound) {
            throw new Error(`Item was not found to remove: ${id}`);
        }
    }

    Clear() {
        this.items = [];
    }
}