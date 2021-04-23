import {KongStat} from "./kongStat";
import { UserImage } from "./userImage";

export class User {
    readonly name: string;
    readonly level: number;
    readonly image: UserImage;
    readonly kongStats: KongStat[];

    // здесь по идее можно хранить массив всех связанных значений, и обновлять только их
    // не создавай каждый раз новые объект
    constructor(name: string, level: number, image: UserImage, kongStats: KongStat[] = []) {
        this.name = name;
        this.level = level;
        this.image = image;
        this.kongStats = kongStats;
    }

    IsKongStatExists(name: string): boolean {
        try {
            this.GetKongStat(name);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    AddKongStats(kongStats: KongStat[], update: boolean = true) {
        for (const kongStat of kongStats) {
            this.AddKongStat(kongStat, update);
        }
    }

    AddKongStat(kongStat: KongStat, update: boolean = true) {
        if (this.IsKongStatExists(kongStat.Name)) {
            if (update) {
                const currentKongStat = this.GetKongStat(kongStat.Name);
                currentKongStat.AddValues(kongStat.Values);
            }
            else {
                throw new Error(`KongStat already exists: ${kongStat.Name}`);
            }
        }
        else {
            this.kongStats.push(kongStat);
        }
    }

    GetKongStat(name: string) {
        for (const kongStat of this.kongStats) {
            if (kongStat.Name === name) {
                return kongStat;
            }
        }
        throw new Error(`KongStat not found: ${name}`);
    }
}