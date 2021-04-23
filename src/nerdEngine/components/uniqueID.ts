export class UniqueID {

    private id: number = 0;
    constructor(public readonly ClassID: string) {}

    get LastID(): string {
        return `${this.ClassID}-${this.id}`
    }

    GetNextID(): string {
        this.id++;
        return `${this.ClassID}-${this.id}`;
    }
}