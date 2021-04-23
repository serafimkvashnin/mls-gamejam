export interface IEqual<T> {
    IsEqual(a: T, b: T): boolean;
}