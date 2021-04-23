import { ClassNames, IGameObject } from "../logic";
import { nerdEngine } from "../nerdEngine";
import { Time } from "./time";
import { Float, RawFloat } from "./float";

export class GameFloat extends Float implements IGameObject {
    public readonly ClassID: ClassNames;
    public readonly ID: string;

    constructor(storage: nerdEngine | null, id: string, value: RawFloat) {
        super(value);
        this.ID = id;
        this.ClassID = ClassNames.GameFloat;

        if (storage) {
            storage.Storage.GameObjects.AddItem(this);
        }
    }

    //todo не должно быть так я думаю. надо сделать удобнее
    IsSameSignature<T extends IGameObject>(object: T): boolean {
        return `${this.ClassID}::${this.ID}` == `${object.ClassID}::${object.ID}`
    }

    get Value(): Float {
        return this.GetValue();
    }

    set Value(value: Float) {
        this.SetValue(value);
    }

    Add(value: RawFloat): void {
        this.Value = this.Value.Plus(value);
    }

    Subtract(value: RawFloat): void {
        this.Value = this.Value.Minus(value);
    }

    Update(dt: Time): void {

    }

    InitFrom(engine: nerdEngine, _oldItem: GameFloat): void {
        this.SetValue(_oldItem.GetValue());
    }
}