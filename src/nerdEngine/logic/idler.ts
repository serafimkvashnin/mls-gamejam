import {Timer} from "./timer";
import {Wallet} from "./wallet";
import {GameData} from "../data";
import {GameObject, ClassNames} from "./gameObject";
import {Float, RawFloat} from "../data";
import {Time} from "../data";
import {Type} from "class-transformer";
import {nerdEngine} from "../nerdEngine";

export class Idler extends GameObject {

    @Type(() => Wallet)
    private readonly wallet: Wallet;

    //todo возможно стоит сделать какую-то проверяемую систему аля Lang для всех айдишников, чтобы не указывать тупо строку

    @Type(() => GameData)
    private readonly valueData: GameData;

    @Type(() => Timer)
    private readonly timer: Timer;

    constructor(engine: nerdEngine | null, id: string, wallet: Wallet, value: RawFloat, time: Time) {
        super(engine, ClassNames.Idler, id);
        this.wallet = wallet;
        this.valueData = new GameData('value', value);
        this.timer = new Timer(engine, `${id}.Timer`, time, 1, false, true, () => {
            this.wallet.Add(this.valueData.Value);
        });
    }

    Update(dt: Time) {
        super.Update(dt);
    }

    Start() {
        this.Timer.Start(false);
    }

    get Wallet(): Wallet {
        return this.wallet;
    }

    get ValueData(): GameData {
        return this.valueData;
    }

    get Value(): Float {
        return this.valueData.Value;
    }

    get Timer(): Timer {
        return this.timer;
    }

    get Duration(): Float {
        return this.timer.Duration;
    }

    get DurationTime(): Time {
        return this.timer.DurationTime;
    }

    get IsStarted(): boolean {
        return this.Timer.IsActive;
    }

    InitFrom(engine: nerdEngine, _oldIdler: Idler): void {
        //skip
    }
}