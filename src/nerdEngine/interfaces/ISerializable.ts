import {IStorageItem} from "../data";
import { nerdEngine } from "../nerdEngine";

//todo возможно, стоит передавать GameLoadManager, и уже него получать массив
export interface ISerializable<ItemType extends IStorageItem> {
    InitFrom<T extends ItemType>(engine: nerdEngine, item: ItemType | T): void;
}