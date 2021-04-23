import { GameEvent, Time } from "../../../nerdEngine";
import { Creature } from "../creatures/Creature";
import { Entity } from "../Entity";
import { SavebleComponent } from "./SaveableComponent";

export class HealthComponent extends SavebleComponent {
    public events = {
        onHealthModified: new GameEvent<Creature, { from: Creature | Entity }>(),
        onHealthEmpty: new GameEvent<Creature, { from: Creature | Entity }>(),
    }

    public unhittable: boolean = false;

    private _health: number = 0;
    private _maxHealth: number | undefined;

    private _invincibilityTimeMs: number = 0;
    private _invincibilityElapsedTimeMs: number = 0;

    constructor() {
        super("HealthComponent");
        //или this.id = this.constructor.name; после вызова super() @Felix

        this.events = {
            onHealthModified: new GameEvent(),
            onHealthEmpty: new GameEvent(),
        }
    }

    public update(time: number, delta: number): void {
        this._invincibilityElapsedTimeMs = Math.max(0, this._invincibilityElapsedTimeMs - delta);
    }

    /** @return Did health modified or not */
    public modifyHealth(amount: number, from: Creature | Entity, modifyMaxHealth: boolean = false): boolean {
        if (amount == 0 || amount < 0 && (this._invincibilityElapsedTimeMs > 0 || this.unhittable)) return false;

        this.setHealth(this.health + amount, from, modifyMaxHealth);
        this.events.onHealthModified.Trigger(this.creature, { from });
        return true;
    }

    /** Use this method to bypass all checks and to set health anyway **/
    public setHealth(amount: number, from: Creature | Entity, increaseMaxHealth: boolean = false) {
        if (amount <= 0) {
            this._health = 0;
            this.events.onHealthEmpty.Trigger(this.creature, { from });
            return;
        }

        if (this._maxHealth) {
            if(amount > this._maxHealth) {
                if(increaseMaxHealth) this.setMaxHealth(amount, from);
                this._health = this._maxHealth;
                return;
            }
        }
        this._health = amount;
    }

    public get health() {
        return this._health;
    }

    public setMaxHealth(amount: number, from: Creature | Entity) {
        if (amount >= 0) {
            this._maxHealth = amount;
            this.setHealth(this.health, from);
        }
    }

    public get maxHealth() {
        return this._maxHealth;
    }

    public set invincibilityTime(msOrTime: Time | number) {
        const ms = typeof msOrTime == "number" ? msOrTime : msOrTime.TotalMs.AsNumber;

        if (ms <= 0) return;
        this._invincibilityTimeMs = ms;
    }

    public get invincibilityTime() {
        return Time.FromMs(this._invincibilityTimeMs);
    }

    public get invincibilityTimeMs() {
        return this._invincibilityTimeMs;
    }

    /**
     * Returns true if maxHealth is not set
     */
    public isFull(): boolean {
        if (this._maxHealth) {
            return this.health >= this._maxHealth;
        }
        else return true;
    }

    public save(): void {
        throw new Error("Method not implemented.");
    }
    public load(): void {
        throw new Error("Method not implemented.");
    }
}