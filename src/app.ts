import 'reflect-metadata';
import Phaser, { Scene } from "phaser";
import './style/main.css';
import GameConfig = Phaser.Types.Core.GameConfig;
import {TestScene} from "./game/scenes/game/TestScene";
import {LoaderScene} from "./game/scenes/LoaderScene";
import {SceneSelector} from "./game/managers/SceneSelector";
import {TestSceneUI} from "./game/scenes/game/TestSceneUI";
import { nerdEngine } from "./nerdEngine";
import { GameManager } from "./game/managers/GameManager";

export let NerdEngine: nerdEngine;
export let PhaserEngine: GameEngine;
export let Game: GameManager;

console.log(`Hello world!`);

const config: Phaser.Types.Core.GameConfig = {
    title: "Convoy Idle",
    version: "0.0.1",
    width: 1920,
    height: 1080,
    type: Phaser.AUTO,
    disableContextMenu: true,
    autoFocus: true,

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    scene: [
        LoaderScene,
        TestScene,
        TestSceneUI,
    ],

    backgroundColor: "#6495ed",
    render: {
        pixelArt: false,
        roundPixels: false,
        mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            customUpdate: false,
        },
    },
};

export class GameEngine extends Phaser.Game {

    public readonly SceneSelector: SceneSelector;
    public readonly Random: Phaser.Math.RandomDataGenerator;

    constructor(config: GameConfig) {
        super(config);

        this.SceneSelector = new SceneSelector(this);
        this.Random = new Phaser.Math.RandomDataGenerator();
        Phaser.Display.Canvas.Smoothing.disable(this.context); //note ни на что не влияет вообще))
        //Phaser.Display.Canvas.CanvasInterpolation.setCrisp(this.canvas); //note буквально тоже самое что pixelArt: true
    }
}

export function StartGame(isLoading: boolean) {
    NerdEngine.Reset();
    //NerdEngine.ResetContent();
    Game = new GameManager(NerdEngine);
    (<any>window).Game = Game;
    NerdEngine.LoadModules();

    NerdEngine.Events.OnContentLoaded.Register(() => {
        console.log(`OnContentLoaded event`);
    })

    if (!isLoading) {
        NerdEngine.OnContentLoaded();
    }
}

window.addEventListener("load", () => {
    PhaserEngine = new GameEngine(config);

    (<any>window).PhaserEngine = PhaserEngine;
    console.log(`[DevInfo] Use 'PhaserEngine' to access Phaser`);

    NerdEngine = new nerdEngine({
        gameName: "Pew pew pew Idle",
        gameVersion: "pre alpha pre beta 0.1",
        buildMode: "Preview",
        contentInitCallback: () => StartGame(false),
        contentResetCallback: () => StartGame(true),
    });

    (<any>window).Nerd = NerdEngine;
    console.log(`[DevInfo] Use 'Nerd' to access nerdEngine`);

    console.log(`[DevInfo] Use 'Game' to access GameManager`);
});



