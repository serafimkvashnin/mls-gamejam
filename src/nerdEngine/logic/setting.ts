import {GameObject, ClassNames} from "./gameObject";
import {IStringConvertible} from "../interfaces";
import {Exclude} from "class-transformer";
import { nerdEngine } from "../nerdEngine";
import { ValueValidator } from "../tools/valueValidator";

export type SettingOnValueChanged<T> = (setting: Setting<T>, value: T) => void;
export type SettingOnContentLoaded<T> = (setting: Setting<T>, value: T) => void;

export class Setting<T extends IStringConvertible> extends GameObject {

    private value!: T;
    public readonly DefaultValue: T;
    @Exclude()
    public readonly Validator: ValueValidator<T>;
    @Exclude()
    public readonly OnValueChanged?: SettingOnValueChanged<T>;
    @Exclude()
    public readonly OnContentLoaded?: SettingOnContentLoaded<T>;

    constructor(engine: nerdEngine | null, id: string,
                defaultValue: T, validator: ValueValidator<T>,
                onValueChanged?: SettingOnValueChanged<T>, onContentLoaded?: SettingOnContentLoaded<T>)
    {
        super(engine, ClassNames.Setting, id);
        this.DefaultValue = defaultValue;
        this.Validator = validator;
        this.OnValueChanged = onValueChanged;
        this.OnContentLoaded = onContentLoaded;

        if (this.Validator) {
            this.Value = defaultValue;
        }
        else {
            this.value = defaultValue;
        }

        engine?.Events.OnContentLoaded.Register(() => {
            if (this.OnContentLoaded) this.OnContentLoaded(this, this.value);
        });
    }

    get Value(): T {
        return this.value;
    }

    set Value(newValue: T) {
        if (this.Validator.IsValueCorrect(newValue)) {
            this.value = this.Validator.CorrectValue(newValue);

            if (this.OnValueChanged) {
                this.OnValueChanged(this, newValue);
            }
        }
        else {
            throw new Error(`Trying to set not possible value: ${newValue} for option: ${this.ID}`);
        }
    }

    public InitFrom(engine: nerdEngine, oldSetting: Setting<T>): void {
        if (this.Validator.IsValueCorrect(oldSetting.Value)) {
            this.Value = oldSetting.Value;
        }

        this.GameObjectEvents.InitiatedFrom.Trigger(this, { source: oldSetting });
    }
}