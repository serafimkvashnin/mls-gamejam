import {ClassNames} from "../../logic";
import {IStorageItem} from "../../data";
import {nerdEngine} from "../../nerdEngine";

export type ClassIDFix = {
    Right: ClassNames | string,
    Aliases: string[]
}

export type ObjectIDFix = {
    Right: string,
    Aliases: string[]
}

//todo REFACTOR
//todo сделать универсальным и сделать возможность добавлять эти фиксы (И ВООБЩЕ ПОТОМ СТОИТ ЭТУ СИСТЕМУ НАКОНЕЦ ПЕРЕДЕЛАТЬ)

export class LoadedContentFixer {

    public readonly ClassIDFixes: ClassIDFix[];
    public readonly ObjectIDFixes: ObjectIDFix[];

    constructor(public readonly Engine: nerdEngine, classIDFixes: ClassIDFix[] = [], objectIDFixes: ObjectIDFix[] = []) {
        this.ClassIDFixes = classIDFixes;
        this.ObjectIDFixes = objectIDFixes;
    }

    FixOutdatedIDs<T extends IStorageItem>(item: T): T {
        for (const classFix of this.ClassIDFixes) {
            if (classFix.Aliases.includes(item.ClassID)) {
                item.ClassID = classFix.Right;
            }
        }

        for (const idFix of this.ObjectIDFixes) {
            if (idFix.Aliases.includes(item.ID)) {
                item.ID = idFix.Right;
            }
        }

        //todo maybe just skip item with wrong classID, and show error only, without exception... dunno
        return item;
    }
}