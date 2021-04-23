import { ContentModule, GameData, Level, Tweak, TweakArray, TweakMinus, TweakPlus, Upgrade } from "../../nerdEngine";
import { Price, PriceArray } from "../../nerdEngine/logic/price";
import { GameManager } from "../managers/GameManager";
import { ProgressionCalc } from "../../nerdEngine/math/valueCalcs";
import { ProgType } from "../../nerdEngine/math/progression";
import { NumberToString } from "../../nerdEngine/utils/utilsText";
import { Game } from "../../app";

export class PlayerContent {

    private readonly _stats: ContentModule<{
        acceleration: GameData,
    }>

    private readonly _upgrades: ContentModule<{
        speed: Upgrade,
        reloadTime: Upgrade,
    }>

    private readonly _permanentUpgrades: ContentModule<{

    }>

    constructor(public readonly GameManager: GameManager) {
        this._stats = new ContentModule(GameManager.Engine, "Player.Stats", () => ({
            acceleration: new GameData("Acceleration", 150),
        }))

        this._upgrades = new ContentModule(GameManager.Engine, "Player.Upgrades", () => ({
            speed: Upgrade.FromConfig({
                engine: GameManager.Engine,
                id: "Player.Speed",
                pricesArray: new PriceArray([
                    new Price(GameManager.Content.wallets.Gold, 5, 1.5, new ProgressionCalc(ProgType.Geometrical))
                ]),
                tweakArray: new TweakArray([
                    new Tweak("Player.Acceleration", false, 50, 50, new ProgressionCalc(ProgType.Arithmetic),
                        new TweakPlus(), [
                            this.stats.acceleration
                        ]),
                ]),
                onBuyFunc: (upgrade) => {
                    console.log(`Player acceleration now: ${this.stats.acceleration.Value.AsNumber}`);
                }
            }),
            reloadTime: Upgrade.FromConfig({
                engine: GameManager.Engine,
                id: "Weapon.ReloadTime",
                level: new Level(0, 5),
                pricesArray: new PriceArray([
                    new Price(GameManager.Content.wallets.Gold, 3, 1.5, new ProgressionCalc(ProgType.Geometrical))
                ]),
                tweakArray: new TweakArray([
                    new Tweak("Weapon.ReloadTime", false, 25, 25, new ProgressionCalc(ProgType.Arithmetic),
                        new TweakMinus(), [
                            Game.Content.weapons.pistol.reloadTime,
                        ]),
                ]),
                onBuyFunc: (upgrade) => {
                    console.log(`Weapon reload time now: ${NumberToString(Game.Content.weapons.pistol.reloadTime.Value)}`)
                }
            })
        }))

        this._permanentUpgrades = new ContentModule(GameManager.Engine, "Player.PermanentUpgrades", () => ({

        }))
    }

    get stats() {
        return this._stats.Get();
    }

    get upgrades() {
        return this._upgrades.Get();
    }

    get permanentUpgrades() {
        return this._permanentUpgrades.Get();
    }
}