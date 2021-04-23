// здесь наверное стоит использовать хэш-таблицу
// ещё сюда надо добавить разные виды сортировки при получении
// сам класс должен быть в Game

import {KongStat, KongStatValue} from "./kongStat";
import {User} from "./user";
import {UserList} from "./usersList";
import {ObjectStorage} from "../data/objectStorage";
import {Time} from "../data";
import {IStorageItem} from "../data";
import { TimeToString } from "../utils/utilsText";

export enum StatScope {
    Day = 'Day',
    Week = 'Week',
    All = 'All',
    Friends = 'Friends',
}

export class StatisticsManager extends ObjectStorage<Statistic> {
    public readonly Statistics: Statistic[];
    public readonly StatisticsList: Statistic[];

    //todo pretty bad code ...
    constructor(statistics: Statistic[]) {
        super(statistics);

        this.Statistics = statistics;
        this.StatisticsList = this.Items;
    }

    GetByName(name: string): Statistic {
        for (const stat of this.StatisticsList) {
            if (stat.Name == name) {
                return stat;
            }
        }

        throw new Error(`Statistics not found by id: ${name}`);
    }

}

export class Statistic implements IStorageItem {
    public readonly ClassID: string;
    private readonly id: string;
    private readonly name: string;
    constructor(id: string, name: string) {
        this.ClassID = this.constructor.name;
        this.id = id;
        this.name = name;
    }

    get ID(): string {
        return this.id;
    }

    get Name(): string {
        return this.name;
    }
}

//todo implement in right way, move to manager
export let statIsLoading = false;
export let statLoadingProgress = 0;

//example: 'https://api.kongregate.com/api/high_scores/lifetime/140337.json?lifetime_page=1'
//todo implement count: number | null, move to StatisticsManager class, cleanup code, add events maybe
export  async function GetStatistics(statistic: Statistic, scope: StatScope, count: number, exclude: string[] = []): Promise<UserList> {
    //const timer = Game.GetItem<Timer>(Content.Timers.KongregateUpdate);
    //const timer = Content.Timers.KongregateUpdate;
    //timer.Stop();
    statIsLoading = true;
    const startDate = new Date();

    const userList = new UserList([]);
    const baseURL = 'https://api.kongregate.com/api/high_scores/';
    let usersLoaded = 0;
    let pagesCount = Math.floor(count / 25);

    for (let page = 1; page <= pagesCount; page++) {
        let kongScope;
        let kongScoresProperty;
        let kongPageStr;

        if (scope == StatScope.Day) {
            kongScope = 'daily';
            kongScoresProperty = 'today_scores';
            kongPageStr = 'today_page=' + page;
        } else if (scope == StatScope.Week) {
            kongScope = 'weekly';
            kongScoresProperty = 'weekly_scores';
            kongPageStr = 'weekly_page=' + page;
        } else if (scope == StatScope.All) {
            kongScope = 'lifetime';
            kongScoresProperty = 'lifetime_scores';
            kongPageStr = 'lifetime_page=' + page;
        } else if (scope == StatScope.Friends) {
            kongScope = 'friends';
            kongScoresProperty = 'friends_scores';
            kongPageStr = 'friends_page=' + page;
        } else {
            throw new Error(`Undefined scope: ${scope}`)
        }

        let url = `${baseURL}${kongScope}/${statistic.ID}.json?${kongPageStr}`;
        let response = await fetch(url);

        if (response.ok) {
            const json = await response.json();
            if (json[kongScoresProperty]) {
                for (const userData of json[kongScoresProperty]) {
                    if (usersLoaded < count) {
                        const kongStat = new KongStat(statistic.ID, statistic.Name, [new KongStatValue(scope, userData['score'])]);
                        const user = new User(userData['username'], userData['Level'], userData['avatar_url'], [kongStat]);

                        if (!exclude.includes(user.name)) {
                            userList.Add(user, true);
                            usersLoaded++;
                            statLoadingProgress = Math.floor(usersLoaded / count * 100);
                        }
                    }
                }
            }
        } else {
            alert("Error in fetch: " + response.status);
        }
    }

    const endDate = new Date();
    const timeInMS = endDate.getTime() - startDate.getTime();
    const timeStr = TimeToString(new Time(0, 0, 0, timeInMS));
    console.log(`Kongregate statistics got!\n - Statistic: ${statistic.Name} (${statistic.ID})\n - Scope: ${scope}\n - Users: ${usersLoaded} / ${count}\n - Time: ${timeStr}`);

    statIsLoading = false;
    //timer.Start();
    return userList;
}