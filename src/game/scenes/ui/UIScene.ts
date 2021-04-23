import { IScene } from "../IScene";

export abstract class UIScene<T extends IScene> extends Phaser.Scene {

    private readonly owner: T;

    public sceneWidth!: number;
    public sceneHeight!: number;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig, owner: T) {
        super(config);
        this.owner = owner;
    }

    create() {
        this.sceneWidth = this.cameras.main.displayWidth;
        this.sceneHeight = this.cameras.main.displayHeight;

        this.cameras.main.setBounds(0, 0, this.sceneWidth, this.sceneHeight);

        this.updateUI();
    }

    update(time: number, delta: number): void {
  
    }

    abstract updateUI(): void;
}