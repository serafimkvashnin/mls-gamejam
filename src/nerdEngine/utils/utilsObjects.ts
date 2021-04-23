export function GetProperties(obj: object) {
    const propertyList = [];
    for (let property in obj) {
        // @ts-ignore
        const value = obj[property];
        const data = {name: property, value: value};
        propertyList.push(data);
    }
    return propertyList;
}

export function ValuesOf<T>(o: { [s: string]: T } | ArrayLike<T>): T[] {
    return Object.values(o);
}

export function IsNull(obj: any): boolean {
    return (typeof obj == 'undefined' || obj == null)
}

export function IsNullOrEmpty(obj: object): boolean {
    return (typeof obj == 'undefined' || obj == null || (obj as Array<any>).length == 0)
}

export function IsEmptyArray(array: Array<any>): boolean {
    return array.length == 0;
}

export function IsNumber(n: number) {
    return !isNaN(parseFloat(n.toString())) && isFinite(n);
}

export function IsObject(obj: any) {
    return (obj !== null && typeof obj === 'object')
}

export function isInteger(num: number) {
    return (num ^ 0) === num;
}

export function AsArray<T>(items?: T | T[]) {
    if (!items) return [] as T[];
    if (Array.isArray(items)) return items as T[];
    else return [ items as T ];
}

export function IsEqualsToOneInArray<T>(valueToCompare: T, compareTo: T | T[], compareFunc?: (a: T, b: T) => boolean): boolean {
    compareTo = AsArray(compareTo);
    for (const value of compareTo) {
        if (compareFunc) {
            if (compareFunc(valueToCompare, value)) {
                return true;
            }
        }
        else {
            if (valueToCompare == value) {
                return true;
            }
        }
    }

    return false;
}

export function IsUndefined(value: any) {
    return typeof value == "undefined";
}