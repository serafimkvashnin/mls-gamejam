import {IGameLoadInfo} from "./IGameSlotInfo";
import LZString from "lz-string";
import { LoadResult, LoadManager } from "../loadManager";

export class SlotGameLoadInfo implements IGameLoadInfo {
    constructor(public readonly LoadManager: LoadManager,
                //public readonly Slot: string,
                public readonly IsCompressed: boolean) {}

    async GetSaveData(): Promise<string | LoadResult> {
        console.log('[SlotGameLoadInfo] Started to loading game from slot..');

        const slotData = await this.LoadManager.Engine.Data.GetItem(this.LoadManager.Engine.Saving.SlotName);
        const backup1 = await this.LoadManager.Engine.Data.GetItem(this.LoadManager.Engine.Saving.Backup1SlotName);
        const backup2 = await this.LoadManager.Engine.Data.GetItem(this.LoadManager.Engine.Saving.Backup2SlotName);

        if (!slotData) {
            console.log(`[SlotGameLoadInfo] No data found in slot, trying to check backups..`);

            if (backup1) {
                console.log(`[SlotGameLoadInfo] Data found in backup #1!`);
            }
            else {
                console.log(`[SlotGameLoadInfo] No data found in backup #1, trying to check other backups..`);

                if (backup2) {
                    console.log(`[SlotGameLoadInfo] Data found in backup #2!`);
                }
                else {
                    console.log(`[SlotGameLoadInfo] No data found in backup #2, so skipping load`);

                    return {
                        IsError: false,
                        Output: "No save data was found to load"
                    }
                }
            }
        }

        let saveData: string | null;

        if (slotData) {
            if (this.IsCompressed) {
                saveData = LZString.decompressFromUTF16(slotData);
            }
            else {
                saveData = slotData;
            }

            if (saveData) return saveData;
            else {
                console.log(`[SlotGameLoadInfo] ERROR, can't load data from slot, trying backup #1 instead`);
            }
        }

        if (backup1) {
            if (this.IsCompressed) {
                saveData = LZString.decompressFromUTF16(backup1);
            }
            else {
                saveData = backup1;
            }

            if (saveData) return saveData;
            else {
                console.log(`[SlotGameLoadInfo] ERROR, can't load data from backup #1, trying backup #2 instead`);
            }
        }

        if (backup2) {
            if (this.IsCompressed) {
                saveData = LZString.decompressFromUTF16(backup2);
            }
            else {
                saveData = backup2;
            }
            if (saveData) return saveData;
        }

        console.log(`[SlotGameLoadInfo] Can't load data from ALL sources!!!`);
        throw new Error('[SlotGameLoadInfo] Save data is not correct');
    }
}