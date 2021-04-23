import {AsArray} from "../utils/utilsObjects";

export type IsEqualCompare<T> = (a: T, b: T) => boolean

export class UniqArray<T> {

    private readonly key?: string;
    private items: T[];
    private readonly isEqual: IsEqualCompare<T>;

    constructor(items: T[] = [], isEqual: IsEqualCompare<T>, key?: string) {
        this.key = key;
        this.items = [];
        this.isEqual = isEqual;

        this.AddRange(items);
    }

    get Items() {
       return this.items;
    }

    //todo maybe check func?
    set Items(value: T[]) {
        this.items = value;
        UniqArray.CheckArray(this.items, this.isEqual, true, this.key);
    }

    /**
     * Returns false, if element is already exists, or throws error if set
     * @constructor
     */
    Add(value: T) {
        for (const item of this.items) {
            if (this.isEqual(value, item)) {
                throw new Error(`Item already exists in UniqArray ${this.key ? `(key: ${this.key})` : ``}`);
            }
        }

        this.items.push(value);
    }

    /**
     * Returns false, if any element of array is already exists, or throws error if set
     * @constructor
     */
    AddRange(values: T[]) {
        for (const item of values) {
            this.Add(item);
        }
    }

    Sort(compare: (a: T, b: T) => number) {
        this.items = this.items.sort(compare);
    }

    static CheckArray<T>(items: T | T[], isEqual: IsEqualCompare<T>, throwError = true, key?: string): boolean {
        items = AsArray(items);
        let ua = new UniqArray<T>([], isEqual, key);
        try {
            ua.AddRange(items);
            return true;
        }
        catch (e) {
            if (throwError) {
                throw e;
            }
            return false;
        }
    }
}