export class TestResult<T> {
    constructor(
        public readonly Result: T,
        public readonly RightResult: T, //todo idk should i give right result or not
        public readonly IsPassed: boolean) {}
}