import {Tweak} from "./tweak";
import {Float, RawFloat} from "../../data";
import {Type} from "class-transformer";
import {UniqArray} from "../../data";
import {AsArray} from "../../utils/utilsObjects";

export class TweakArray {
    public readonly classID: string;

    @Type(() => Tweak)
    private tweaks: UniqArray<Tweak>;

    constructor(tweaks?: Tweak | Tweak[], checkForUniq: boolean = true) {
        this.classID = this.constructor.name;
        this.tweaks = new UniqArray<Tweak>(AsArray(tweaks), Tweak.IsEqualUID);
    }

    Reset() {
        for (const tweak of this.Items) {
            tweak.Reset();
            tweak.AddOrUpdateToGameData();
        }
    }

    get Length(): number {
        return this.Items.length;
    }

    get Items(): Tweak[] {
        return this.tweaks.Items;
    }

    Upgrade(count: RawFloat) {
        count = new Float(count);
        for (const tweak of this.Items) {
            tweak.Upgrade(count);
        }
    }

    SetToLevel(level: RawFloat) {
        for (const tweak of this.Items) {
            tweak.SetToLevel(level);
        }
    }

    AddOrUpdateToGameData() {
        for (const tweak of this.Items) {
            tweak.AddOrUpdateToGameData();
        }
    }


    Toggle(enabled: boolean) {
        for (const tweak of this.Items) {
            tweak.Toggle(enabled);
        }
    }

    GetTweak(idOrTweak: string | Tweak): Tweak {
        const id = idOrTweak instanceof Tweak ? idOrTweak.ID : idOrTweak;

        for (let i = 0; i < this.Items.length; i++) {
            const tweak = this.Items[i];
            if (tweak.ID === id) {
                return tweak;
            }
        }
        throw new Error(`Tweak '${id}' was not found`);
    }

    HasTweak(idOrTweak: string | Tweak) {
        const id = idOrTweak instanceof Tweak ? idOrTweak.ID : idOrTweak;

        for (let i = 0; i < this.Items.length; i++) {
            const tweak = this.Items[i];
            if (tweak.ID === id) {
                return true;
            }
        }

        return false;
    }

    HasTweakUID(uid: string) {
        for (let i = 0; i < this.Items.length; i++) {
            const tweak = this.Items[i];
            if (tweak.UID == uid) {
                return true;
            }
        }

        return false;
    }

    SortTweaks() {
        this.tweaks.Items = Tweak.SortTweaks(this.Items);
    }

    Remove(idOrTweak: string | Tweak) {
        const id = idOrTweak instanceof Tweak ? idOrTweak.ID : idOrTweak;
        for (let i = 0; i < this.Length; i++) {
            if (this.Items[i].ID == id) {
                this.Items.splice(i, 1);
            }
        }

        throw new Error(`Tweak '${id}' was not found`);
    }
}