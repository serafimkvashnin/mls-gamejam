import {TestResult} from "./testResult";
import {IStorageItem} from "../data";

export class Test<T> implements IStorageItem {
    public readonly ID: string;
    public readonly ClassID: string;
    private readonly description: string;
    private readonly rightResult: T;
    private readonly checkFunction: () => T;
    constructor(id: string, description: string, rightResult: T, checkFunction: () => T) {
        this.ID = id;
        this.ClassID = this.constructor.name;
        this.description = description;
        this.rightResult = rightResult;
        this.checkFunction = checkFunction;
    }

    Description(): string {
        return this.description;
    }

    RightResult(): T {
        return this.rightResult;
    }

    Check(): TestResult<T> | Error {
        try {
            let result = this.checkFunction();
            if (result == this.rightResult) {
                return new TestResult<T>(result, this.rightResult, true);
            }
            else {
                return new TestResult<T>(result, this.rightResult, false);
            }
        }
        catch (error) {
            return error;
        }
    }
}