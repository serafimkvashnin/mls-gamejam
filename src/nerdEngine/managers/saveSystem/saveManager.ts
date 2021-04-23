import { nerdEngine } from "../../nerdEngine";
import { serialize, Type } from "class-transformer";
import LZString from "lz-string";
import { GameObject, IGameObject } from "../../logic";
import { ISaveMaker } from "./ISaveMaker";
import { LoadedContentFixer } from "./loadedContentFixer";

export class SaveData {
    @Type(() => GameObject)
    public readonly Items: IGameObject[]

    constructor(items: IGameObject[]) {
        this.Items = items;
    }
}

//todo короче, мне как-то надо бы сделать это всё универсальным, но я пока не знаю как ;)

// export interface ISaveData {
//     Get(engine: nerdEngine): ISaveData;
// }
//
// export interface ISaveManager<T> {
//     GetSaveString()
// }

export class SaveManager {

    public readonly SlotName: string;
    public readonly Backup1SlotName: string;
    public readonly Backup2SlotName: string;

    constructor(public readonly Engine: nerdEngine, public readonly SaveMaker: ISaveMaker, slotName: string = "Save1") {
        this.SlotName = slotName;
        this.Backup1SlotName = slotName + "_backup1";
        this.Backup2SlotName = slotName + "_backup2";
    }
    //todo bug я почти уверен тут будет баг в том что теперь у меня TimerStorage и ContentStorage объединены
    // а раньше они были отдельно, поэтому таймеры со старых сейвов не загрузяться. с другой стороны, в DFI
    // у меня никакие таймеры и не грузяться

    //todo custom save data type


    SaveGame() {
        this.SaveMaker.SaveGame(this);
    }

    GetSaveData() {
        return { Items: this.Engine.Storage.GameObjects.Items };
    }

    GetSaveString(compress: boolean) {
        const saveData = this.GetSaveData();

        const serializedSaveData = serialize(saveData)
        const saveString = compress ? LZString.compressToUTF16(serializedSaveData) : serializedSaveData;
        return saveString;
    }
}