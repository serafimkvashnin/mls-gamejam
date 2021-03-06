import { SceneId } from "../registry/enums/SceneId";
import { ResourceManager } from "../managers/ResourceManager";
import Color = Phaser.Display.Color;
import FilterMode = Phaser.Textures.FilterMode;
//import { NerdEngine } from "../../engineSetup";

export class LoaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: SceneId.LoaderScene,
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
            //NerdEngine.InitContent();
            //PhaserEngine.scene.switch(this, SceneId.GameScene);

            this.scene.manager.switch(this, SceneId.GameScene);
            this.load.textureManager.each(texture => {
                texture.setFilter(FilterMode.NEAREST);
                console.log(`sources: ${texture.source.length}, scale mode: ${texture.source[0].scaleMode}`);
                texture.source[0].scaleMode = 0;
            }, {});
        });

        this.ResourceManager = new ResourceManager(this);
        this.ResourceManager.Preload();
    }
}