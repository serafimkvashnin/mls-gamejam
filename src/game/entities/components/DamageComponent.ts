import { Entity } from "../Entity";
import { Float, RawFloat } from "../../../nerdEngine/data";
import { Creature } from "../creatures/Creature";
import { GameEvent } from "../../../nerdEngine/components";
import { Component } from "./Component";

//note: если у нас будет более сложная сложная механика урона (разные виды урона, например),
// то можно будет всё это хранить здесь @Felix

//todo HitComponent
export class DamageComponent extends Component {
    public events = {
        onModified: new GameEvent<Creature, { from: Creature | Entity }>(),
    }

    //note: такое дефолтное значение, чтобы если ты забудешь установить урон,
    // то сразу поймешь это по странному значению урона (нуачо) ( @Felix
    private _damage: Float = new Float(8080808);

    constructor() {
        super("DamageComponent");
    }

    public setDamage(value: RawFloat) {
        this._damage = new Float(value);
    }

    public get damage(): Float {
        return this._damage;
    }
}