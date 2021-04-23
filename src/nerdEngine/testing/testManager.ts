import {ObjectStorage} from "../data/objectStorage";
import {Test} from "./test";
import {TestResult} from "./testResult";

export class TestManager extends ObjectStorage<Test<any>> {
    constructor(public readonly ModuleName: string, tests: Test<any>[]) {
        super(tests);
    }

    CheckAll(detailedLog: boolean = false, showOnlyFailed: boolean = false, showStartingInfo: boolean = false): void {
        let testsPassed = 0;

        const startTime = performance.now();
        if (showStartingInfo) {
            console.log(`TestModule: '${this.ModuleName}'\nTesting started for ${this.Items.length} items..`);
        }
        let i = 1;
        for (const test of this.Items) {
            const result = test.Check();
            if (result instanceof Error) {
                if (detailedLog) {
                    console.log(`${i}. ${test.Description()}: %cERROR! \n > Error message: ${result.message}`, 'color: #ff4db8');
                    throw result;
                }
            }
            else {
                const testResult = result as TestResult<any>;
                if (testResult.IsPassed) {
                    testsPassed++;
                    if (!showOnlyFailed) {
                        console.log(`${i}. ${test.Description()}: %cPASSED!`, 'color: #42a828');
                    }
                }
                else {
                    console.log(
                        `${i}. ${test.Description()}: %cFAILED!`
                        + `\n > Right result: ${test.RightResult()}`
                        + `\n > Result: ${testResult.Result}`, `color: #ff4d4d`);
                }
            }
            i++;
        }
        const elapsedTime = performance.now() - startTime;
        const allPassed = testsPassed == this.Items.length;
        console.log(
            `%cTestModule '${this.ModuleName}' checking completed!`
            + `\nTests passed: ${testsPassed} / ${this.Items.length}`
            + `\nElapsed time: ${Math.floor(elapsedTime)} ms.`,
            `color:` + (allPassed ? '#42a828' : '#ff4d4d')
        );

    }
}