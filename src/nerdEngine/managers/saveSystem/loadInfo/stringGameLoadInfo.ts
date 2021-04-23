import {IGameLoadInfo} from "./IGameSlotInfo";
import LZString from "lz-string";

export class StringGameLoadInfo implements IGameLoadInfo {
    constructor(public readonly DataString: string, public readonly IsCompressed: boolean) {}

    async GetSaveData() {
        if (!this.DataString) {
            return {
                IsError: true,
                Error: new Error("Save data string was empty")
            }
        }

        let saveData;
        if (this.IsCompressed) {
            saveData = LZString.decompressFromUTF16(this.DataString);
        }
        else {
            saveData = this.DataString;
        }

        if (saveData) {
            return saveData;
        }
        else {
            throw new Error('Save data is not correct');
        }
    }
}