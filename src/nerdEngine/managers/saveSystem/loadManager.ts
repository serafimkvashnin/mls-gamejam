//todo actually i think it can be good better way to do it in actual save manager, like ISaveType with Load func, dunno..

import { IGameLoadInfo, SlotGameLoadInfo, StringGameLoadInfo } from "./loadInfo";
import { LoadedContentFixer } from "./index";
import { GameEvent } from "../../components";
import { ClassNames, Container, GameObject, IGameObject, Timer, Upgrade } from "../../logic";
import { deserialize, Exclude, plainToClass } from "class-transformer";
import { IsObject, ValuesOf } from "../../utils/utilsObjects";

import { CurrentTimeStr } from "../../utils/utilsText";
import { nerdEngine } from "../../nerdEngine";
import { SaveData } from "./saveManager";
import { ClassConstructor } from "../../data";

export type LoadResult = {
    IsError: boolean,
    Error?: Error,
    Output?: string
}

export enum LoadType {
    Auto = "Auto",
    Manual = "Manual"
}

export class LoadManager {

    //todo implement
    @Exclude()
    public readonly Events = {
        OnSaved: new GameEvent<LoadManager, {}>(),
        OnLoadStarted: new GameEvent<LoadManager, { saveString: string }>(),
        OnLoadDeserializationCompleted: new GameEvent<LoadManager, { saveData: SaveData }>(),
        OnLoadStage1Completed: new GameEvent<LoadManager, { gameObjects: GameObject[], timers: Timer[] }>(),
        OnLoadStage2Completed: new GameEvent<LoadManager, { gameObjects: GameObject[], timers: Timer[] }>(),
        OnLoadStage3Completed: new GameEvent<LoadManager, { gameObjects: GameObject[], timers: Timer[] }>(),
    };

    public readonly CustomLoadHandlers: {
        PlainToClassStage: ((item: IGameObject) => void)[],
        InitFromStage: ((currentItem: IGameObject | undefined, item: IGameObject) => void)[]
        OptionalActionsStage: ((currentItem: IGameObject | undefined, item: IGameObject) => void)[],
    }

    //todo вообще не обязательно делать всё ридонли и передавать только через конструктор!
    public restartToLoadCallback?: (loadManger: LoadManager) => void;

    public ContentFixer: LoadedContentFixer;

    private loadID: number = 0;

    private isLoading: boolean = false;
    private loadInfo?: IGameLoadInfo = undefined;
    private loadType?: LoadType = undefined;
    private isSkippingNextLoad: boolean = false;
    private lastLoadInfo?: IGameLoadInfo = undefined;

    //todo КАРОЧЕ. можно сделать кастомную функцию инициализации контента в nerdEngine, которая будет настраиваться
    // но вызываться будет в движке, и там же будет функция ресета контента которую будет вызывать лоад менеджер

    /**
     * @param Engine
     * @param contentFixer
     * @param customTypes
     * @param slotName SlotName is combined with Engine.GameName (TODO, option to do this maybe?)
     */
    constructor(public Engine: nerdEngine, contentFixer?: LoadedContentFixer)
    {
        this.ContentFixer = contentFixer ?? new LoadedContentFixer(Engine);

        this.CustomLoadHandlers = {
            PlainToClassStage: [],
            InitFromStage: [],
            OptionalActionsStage: [],
        }
    }

    get LoadID() {
        return this.loadID;
    }

    get IsSkippingNextLoad(): boolean {
        return this.isSkippingNextLoad;
    }

    get LastLoadInfo() {
        return this.lastLoadInfo;
    }

    get IsLoading(): boolean {
        return this.isLoading;
    }

    get LoadInfo(): IGameLoadInfo | undefined {
        return this.loadInfo;
    }

    get LoadType() {
        return this.loadType;
    }

    SkipNextLoad() {
        this.isSkippingNextLoad = true;
    }

    SetLoadGame(type: LoadType, info: IGameLoadInfo) {
        if (!this.IsLoading) {
            this.loadType = type;
            this.isLoading = true;
            this.loadInfo = info;
            this.lastLoadInfo = this.loadInfo;
        } else {
            throw new Error('Game is already loading!');
        }
    }

    //todo async?
    RestartToLoad() {
        //todo LoadManager.IsLoading check?
        if (this.restartToLoadCallback) {
            this.restartToLoadCallback(this);
        }
        this.LoadGame()
    }

    protected OnLoadFinished() {
        console.log(`[SaveManager] Load finished, increasing LoadID (${this.loadID} -> ${this.loadID + 1})`);
        this.loadID++;
    }

    //todo придумать более адекватный способ разделить настройку загрузки и саму загрузку
    LoadGameFromSlot(loadType: LoadType, isCompressed: boolean = true) {
        this.SetLoadGame(loadType, new SlotGameLoadInfo(this, isCompressed));
        //todo отрефакторить
        this.RestartToLoad();
    }

    LoadGameFromString(loadType: LoadType, rawData: string, isCompressed: boolean = true) {
        this.SetLoadGame(loadType, new StringGameLoadInfo(rawData, isCompressed));
        this.RestartToLoad();
    }

    //todo возвращать деньги, за все грейды, которые были убраны в новом апдейте, но остались в сейве
    async LoadGame() {
        try {
            if (this.IsSkippingNextLoad) {
                this.isSkippingNextLoad = false;

                this.loadType = undefined;
                this.isLoading = false;
                this.loadInfo = undefined;

                this.Engine.ResetContent();
            }
            else {
                if (!this.IsLoading) throw new Error(`Flag 'IsLoading' was not set!`);
                if (!this.loadInfo) throw new Error(`LoadInfo was not set!`);

                const saveDataOrResult = await this.loadInfo.GetSaveData();

                if (typeof saveDataOrResult == "string") {
                    await this.LoadSaveData(saveDataOrResult as string)
                }
                else {
                    if (saveDataOrResult.IsError) {
                        throw saveDataOrResult.Error;
                    } else {
                        console.log(saveDataOrResult.Output);
                    }
                }
            }

            this.loadType = undefined;
            this.isLoading = false;
            this.loadInfo = undefined;
            //TODO TODO TODO Construct3.globalVars.IsGameLoading = 0;

            this.Engine.OnContentLoaded();
            this.OnLoadFinished();
        }
        catch (e) {
            this.Engine.System.IsGameCrashed = true;

            this.Reset();
            console.error(e);
        }
    }

    Reset() {
        this.loadType = undefined;
        this.isLoading = false;
        this.loadInfo = undefined;
    }

    private async LoadSaveData(saveData: string) {
        //await Construct3.callFunction("DoTick");
        //todo save version id, for ability to do some version specific migration

        //todo надо сделать систему Aliases, чтобы когда выходит новый апдейт, нормально загружались грейды которые были
        // переименованы

        //todo лучше сделать SaveManager.IsGameLoading или типо того
        //Game.System.IsContentLoaded = false;
        console.log(`${CurrentTimeStr()} [LoadGame] Game loading started..`);

        const deserializedSaveData = deserialize<SaveData>(SaveData, saveData);

        console.log(`[LoadGame] Deserialized ${deserializedSaveData.Items.length} objects with data`);
        this.Events.OnLoadDeserializationCompleted.Trigger(this, {saveData: deserializedSaveData});

        const classifiedItems: GameObject[] = [];
        const classifiedTimers: Timer[] = [];
        console.log(`${CurrentTimeStr()} [LoadGame] Data deserialize finished!`);

        // Stage 1: Init (just convert plain object to classes)

        for (let rawItem of deserializedSaveData.Items) {
            rawItem = this.ContentFixer.FixOutdatedIDs(rawItem);

            const item = plainToClass(this.GetClassByName(rawItem.ClassID), rawItem);
            classifiedItems.push(item);

            if (item.ClassID == ClassNames.Container) {
                let container = item as Container<any>;
                if (IsObject(container.Value)) {
                    if ("ClassID" in container.Value) {
                        container.Value = plainToClass(this.GetClassByName(container.Value.ClassID), container.Value);
                        container.SetBaseValue(plainToClass(this.GetClassByName(container.Value.ClassID), container.BaseValue));
                    }
                }
            }

            //todo я не уверен что такая система очень хорошо работает, было бы неплохо сделать всё более гибким
            // я имею ввиду, добавить возможность хендлеру перехватывать дефолтную обработку и например вообзе скипать
            // обработку апгрейда!
            this.CustomLoadHandlers.PlainToClassStage.forEach(callback => callback(item));
        }

        this.Events.OnLoadStage1Completed.Trigger(this, {gameObjects: classifiedItems, timers: classifiedTimers});

        console.log(`${CurrentTimeStr()} [LoadGame] Stage #1 completed!`);

        // Stage 2: Merge save data to current content
        for (const item of classifiedItems) {
            const currentItem = this.Engine.Storage.GameObjects.Items.find((obj) => obj.IsSameSignature(item));

            if (currentItem) {
                currentItem.InitFrom(this.Engine, item);
            } else {
                console.log(`${CurrentTimeStr()} No item found to replace for ${item.ClassID} - ${item.ID}`);

                switch (item.ClassID) {
                    //todo SubClassID??
                    case ClassNames.Upgrade: {
                        const upgrade = item as Upgrade;
                        upgrade.PriceArray.Refund(this.Engine);
                        break;
                    }
                }
            }

            this.CustomLoadHandlers.InitFromStage.forEach(callback => callback(currentItem, item));

            //Do i need to add old item? Because if there is nothing to replace, item was deleted in update
        }

        this.Events.OnLoadStage2Completed.Trigger(this, {gameObjects: classifiedItems, timers: classifiedTimers});
        console.log(`${CurrentTimeStr()} [LoadGame] Stage #2 completed!`);

        //todo Наверное лучше сделать этот этап для объектов, которые всё таки попали в контент?
        // а то смысла по сравнению со вторым этапом вообще нет

        //todo ещё да, контент ведь по сути загружается ещё в Game.LoadModules(), так что ещё до
        // старта OnContentLoaded, весь контент уже готов к использованию, а то что происходит в OnContentLoaded
        // по сути всякие системные штуки, которые не особо связаны с контентом
        // надо как-то решить эту херню
        this.Engine.Events.OnContentLoaded.Register(() => {
            // Stage 3: Specific reinit
            for (const item of classifiedItems) {
                const currentItem = this.Engine.Storage.GameObjects.Items.find((obj) => obj.IsSameSignature(item));

                if (currentItem) {
                    this.CustomLoadHandlers.OptionalActionsStage.forEach(callback => callback(currentItem, item));
                }
            }
        });

        console.log('[LoadGame] Stage #3 completed!');
        //await Construct3.callFunction("DoTick");
    }

    GetClassByName(name: string): new (...args: any[]) => any {
        let typeList = this.Engine.GetTypeList();
        //console.log(typeList);
        for (const _key in typeList) {
            let key = _key as keyof typeof typeList;
            let type = typeList[key];
            if (key == name) {
                return type;
            }
        }
        throw new Error(`Type '${name}' was not found`);
    }
}