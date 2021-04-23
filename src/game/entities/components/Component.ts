import { Creature } from "../creatures/Creature";


export abstract class Component {
    public creature!: Creature;

    public constructor(public readonly id: string) {}

    public update(time: number, delta: number): void { }
}