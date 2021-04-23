import { SaveManager } from "./saveManager";

export interface ISaveMaker {
    SaveGame(saveManager: SaveManager): void;
    EraseSlot(slotName?: string, eraseBackups?: boolean): void;

    //todo should i make save backup's as a ISaveWorker requirement?
}