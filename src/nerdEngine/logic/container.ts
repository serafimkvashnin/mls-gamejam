import {ClassNames, GameObject} from "./gameObject";
import { Exclude, Expose, plainToClass } from "class-transformer";
import {Float} from "../data";
import {Time} from "../data";
import {IsObject} from "../utils/utilsObjects";
import {RawFloat} from "../data";
import { nerdEngine } from "../nerdEngine";

export type DataContainer<T> = {
    Save(data: T): any,
    Load(data: any): T,
}

export let DateContainer: DataContainer<Date> = {
    Save(data: Date): string {
        return data.toDateString();
    },

    Load(data: string): Date {
        return new Date(data);
    }
}

export let TimeContainer: DataContainer<Time> = {
    Save(data: Time): string {
        return data.TotalMilliseconds.toString();
    },

    Load(timeMSorTimeRaw: string | { milliseconds: RawFloat }): Time {
        if (typeof timeMSorTimeRaw != "string") {
            return new Time(0, 0, 0, new Float(timeMSorTimeRaw.milliseconds));
        }
        else {
            return new Time(0, 0, 0, parseFloat(timeMSorTimeRaw));
        }
    }
}

export let FloatContainer: DataContainer<Float> = {
    Save(data: Float): string {
        return data.toString();
    },

    Load(data: string | object): Float {
        if (typeof data == "string") {
            return new Float(data);
        }
        else {
            return plainToClass(Float, data);
        }
    }
}

//export let TimeContainer

//todo на самом деле, я могу сделать какие-нибудь внутренние классы, которые будут отвечать за хранение разных данных
// и это будет скрытно. Либо конечно можно просто клипать под классы контейнера с кастоымни функциями сохранения и загрузки
// можно ещё опять же юзать декораторы класстрансформера, чтобы указывать туда кастомные функции

//TODO !!! КОРОЧЕ, ПРОСТО СДЕЛАТЬ GAME[TYPE] КЛАССЫ, ЧТОБ НЕ МУЧАТЬСЯ, СЕРЬЁЗНО

export type ContainerOnValueChanged<T> = (value: T) => void;

@Expose()
export class Container<T> extends GameObject {

    @Exclude()
    public readonly DataManager?: DataContainer<T>;

    private value: T;

    @Exclude()
    private baseValue: T;

    @Exclude()
    private onChanged?: ContainerOnValueChanged<T>;

    constructor(engine: nerdEngine | null, id: string, value: T, dataManager?: DataContainer<T>,
                onChanged?: ContainerOnValueChanged<T>)
    {
        super(engine, ClassNames.Container, id);

        this.value = value
        this.baseValue = this.value;
        this.DataManager = dataManager;
        this.onChanged = onChanged;
    }

    get BaseValue(): T {
        return this.baseValue;
    }

    SetBaseValue(baseValue: T) {
        this.baseValue = baseValue;
    }

    get Value(): T {
        return this.value;
    }

    set Value(value: T) {
        this.value = value;

        if (this.onChanged) {
            this.onChanged(value);
        }
    }

    Reset() {
        this.value = this.BaseValue;
    }

    InitFrom(engine: nerdEngine, container: Container<T>): void {
        //console.log(`Container init-from for ${this.ID}`);
        let oldValue = container.value as any;
        if (this.DataManager)   {
            oldValue = this.DataManager.Load(oldValue);
        }

        if (typeof oldValue != "string" && typeof this.value == "string") {
            if (IsObject(oldValue) && "toString" in oldValue) {
                oldValue = oldValue.toString();
            }
        }

        if (typeof oldValue == "number" && this.value instanceof Float) {
            oldValue = new Float(oldValue);
            //console.log(`Container value moved from number to float`);
        }
        else if (typeof this.value == "number" && oldValue instanceof Float) {
            oldValue = oldValue.AsNumber;
            //console.log(`Container value moved from float to number`);
        }

        this.value = oldValue;
        //console.log(`Loaded value ${JSON.stringify(this.value)} for Container ${this.ID}`);
    }
}