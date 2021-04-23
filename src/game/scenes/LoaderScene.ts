import {ResourceManager} from "../managers/ResourceManager";
import GameObject = Phaser.GameObjects.GameObject;
import {SceneID} from "../managers/registers/SceneID";
import { NerdEngine, PhaserEngine } from "../../app";
import Color = Phaser.Display.Color;
import FilterMode = Phaser.Textures.FilterMode;
import { MusicId } from "../managers/registers/ResourceRegister";

export class LoaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: SceneID.LoaderScene,
        });
    }

    public ResourceManager!: ResourceManager;

    preload() {
        this.cameras.main.setBackgroundColor("#000000")
        const progress = this.add.graphics();

        this.load.on('progress', (value: number) => {
            progress.clear();
            progress.fillStyle(Color.HexStringToColor("#ff3ce3").color, 1);
            progress.fillRect(0, this.cameras.main.height/2, this.cameras.main.width * value, 100);
        });

        this.load.on('complete', () => {
            // NerdEngine.Events.OnContentLoaded.Register(() => {
            //     PhaserEngine.SceneSelector.SwitchScene(this, SceneID.TestScene);
            // })
            NerdEngine.InitContent();
            PhaserEngine.SceneSelector.SwitchScene(this, SceneID.TestScene);

                this.load.textureManager.each(texture => {
                    texture.setFilter(FilterMode.NEAREST);
                    texture.source[0].scaleMode = 0;
                }, {});

            this.sound.play(MusicId.Illest, {
                volume: 0.3,
                loop: true,
            })
        });

        this.ResourceManager = new ResourceManager(this);
        this.ResourceManager.Preload();

        this.load.aseprite("player", "assets/sprites/creatures/player.png", "assets/sprites/creatures/player.json");
        this.load.aseprite("enemy", "assets/sprites/creatures/enemies/enemy.png", "assets/sprites/creatures/enemies/enemy.json");
    }
}