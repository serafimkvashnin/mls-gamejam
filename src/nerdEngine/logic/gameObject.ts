import { Time } from "../data";
import {IUpdate} from "../interfaces";
import {ISerializable} from "../interfaces"
import { Exclude, Expose } from "class-transformer";
import {IStorageItem} from "../data";
import { nerdEngine } from "../nerdEngine";
import { GameEvent } from "../components";

export enum ClassNames {
    ActionWithCooldown = "ActionWithCooldown",
    Achievement = "Achievement",
    Idler = "Idler",
    Points = "Points",
    Price = "Price",
    CustomPrice = "CustomPrice", //todo subclassID?
    Setting = "Setting",
    Stat = "Stat",
    Timer = "Timer",

    Upgrade = "Upgrade",

    Wallet = "Wallet",
    Unlock = "Unlock",

    Container = "Container",
    GameFloat = "GameFloat",
}

export interface IGameObject extends ISerializable<IGameObject> /*<ClassType extends string = string, Type extends IStorageItem>*/ {
    readonly ClassID: ClassNames | string;
    readonly ID: string;

    IsSameSignature<T extends IGameObject>(object: T): boolean;
    Update(dt: Time): void;
}

export abstract class GameObject
    implements IGameObject, IUpdate, IStorageItem {

    /**
     * InitiatedFrom need to be called manually when InitFrom finished
     */
    @Exclude()
    public readonly GameObjectEvents = {
        InitiatedFrom: new GameEvent<GameObject, { source: GameObject }>()
    }

    @Expose()
    public ClassID: ClassNames | string;
    @Expose()
    public readonly ID: string;

    @Exclude()
    public readonly Engine: nerdEngine | null;

    protected constructor(engine: nerdEngine | null, classID: ClassNames | string, id: string) {
        this.ClassID = classID ?? "@GameObject.ClassID";
        this.ID = id ?? "@GameObject.ID";

        this.Engine = engine;
        if (engine) {
            engine.Storage.GameObjects.AddItem(this);
        }
    }

    public IsSameSignature<T extends IGameObject>(gameObject: T) {
        return (`${this.ClassID}::${this.ID}` == `${gameObject.ClassID}::${gameObject.ID}`);
    }

    public Update(_dt: Time) {

    }

    public abstract InitFrom(engine: nerdEngine, _oldObject: GameObject): void;
}


