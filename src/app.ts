import 'reflect-metadata';
import GameConfig = Phaser.Types.Core.GameConfig;
import {LoaderScene} from "./game/scenes/LoaderScene";
// @ts-ignore
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { InitEngine } from "./engineSetup";

export let PhaserEngine: GameEngine;
//export let Game: GameManager;

const config: Phaser.Types.Core.GameConfig = {
    title: "Придумай название!",
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
        // TestScene,
        // TestSceneUI,
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

    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: RexUIPlugin,
            mapping: 'rexUI'
        },
        // ...
        ]
    }
};

export class GameEngine extends Phaser.Game {

    //public readonly SceneSelector: SceneSelector;
    public readonly Random: Phaser.Math.RandomDataGenerator;

    constructor(config: GameConfig) {
        super(config);

        //this.SceneSelector = new SceneSelector(this);
        this.Random = new Phaser.Math.RandomDataGenerator();
        Phaser.Display.Canvas.Smoothing.disable(this.context); //note ни на что не влияет вообще))
        //Phaser.Display.Canvas.CanvasInterpolation.setCrisp(this.canvas); //note буквально тоже самое что pixelArt: true
    }
}

window.addEventListener("load", () => {
    PhaserEngine = new GameEngine(config);
    InitEngine();

    (<any>window).PhaserEngine = PhaserEngine;
    console.log(`[DevInfo] Use 'PhaserEngine' to access Phaser`);

    console.log(`[DevInfo] Use 'Game' to access GameManager`);
});



