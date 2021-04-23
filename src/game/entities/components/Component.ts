import { ICreature } from "../creatures/ICreature";

export abstract class Component {
    public creature!: ICreature;

    public constructor(public readonly id: string) {}

    public update(time: number, delta: number): void { }
}