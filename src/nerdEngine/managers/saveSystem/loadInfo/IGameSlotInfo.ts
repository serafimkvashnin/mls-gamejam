import {LoadResult} from "../loadManager";

export interface IGameLoadInfo {
    GetSaveData(): Promise<string | LoadResult>;
}