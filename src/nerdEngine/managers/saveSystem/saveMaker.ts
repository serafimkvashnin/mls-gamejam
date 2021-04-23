/**
 * Default SaveMaker class, that uses browser's LocalStorage
 */
 import { ISaveMaker } from "./ISaveMaker";
 import { SaveManager } from "./saveManager";
 import { nerdEngine } from "../../nerdEngine";
 
 export class SaveMaker implements ISaveMaker {
     constructor(public readonly Engine: nerdEngine) {
 
     }
 
     async SaveGame() {
         let loading = this.Engine.Loading;
         let saving = this.Engine.Saving;
         await this.Engine.Data.SetItem(loading.SlotName, saving.GetSaveString(true));
         console.log(`Game saved! (${loading.SlotName})`)
     }
 
     async EraseSlot(slotName?: string, eraseBackups = true) {
         await this.Engine.Data.RemoveItem(slotName ?? this.Engine.Loading.SlotName);
 
         if (eraseBackups) {
             await this.Engine.Data.RemoveItem(slotName + "_backup1");
             await this.Engine.Data.RemoveItem(slotName + "_backup2");
         }
 
         console.log(`[SaveSystem] Slot '${slotName}' was erased, backups erased: ${eraseBackups}`);
     }
 
 }