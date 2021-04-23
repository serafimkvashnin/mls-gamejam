import {Time} from "../data";

export interface IUpdate {
    Update(dt: Time): void;
}