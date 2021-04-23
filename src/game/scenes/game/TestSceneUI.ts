import { SceneID } from "../../managers/registers/SceneID";
import { TestScene } from "./TestScene";
import { MouseHelper } from "../../utils/MouseHelper";
import { UpgradeInfo } from "../../entities/gameGUI/prefabs/UpgradeInfo";
import { TextureId } from "../../managers/registers/ResourceRegister";
import { GameButton } from "../../gui/button/GameButton";
import { LoadType } from "../../../nerdEngine/managers/saveSystem";
import { NumberToString } from "../../../nerdEngine/utils/utilsText";
import { GUIStyles } from "../../entities/gameGUI/styles/GameMapUIStyles";
import Size = Phaser.Structs.Size;
import { Game } from "../../../app";
import Vector2 = Phaser.Math.Vector2;
import Color = Phaser.Display.Color;
import { GameLayer } from "../../gui/layer/GameLayer";
import { ProgressBar } from "../../gui/probressBar/ProgressBar";
import { HealthComponent } from "../../entities/components/HealthComponent";
import { GameEvent } from "../../../nerdEngine/components";
import Tween = Phaser.Tweens.Tween;

export class TestSceneUI extends Phaser.Scene {

    constructor() {
        super({
            key: SceneID.TestSceneUI,
        });
    }

    private owner!: TestScene;
    private debugInfo!: Phaser.GameObjects.Text;

    private upgradesButton!: GameButton;
    private upgradesMenu!: GameLayer;

    private resetButton!: GameButton;
    private saveButton!: GameButton;
    private loadButton!: GameButton;

    private speedUpgradeInfo!: UpgradeInfo;
    private reloadTimeUpgradeInfo!: UpgradeInfo;

    public coinsCounter!: {
        text: Phaser.GameObjects.Text,
        icon: Phaser.GameObjects.Image,
        back: Phaser.GameObjects.Rectangle,
    }

    public waveCounter!: {
        text: Phaser.GameObjects.Text,
        back: Phaser.GameObjects.Rectangle,
    }

    public playerHealthBar!: ProgressBar;

    public worldWidth!: number;
    public worldHeight!: number;

    create() {
        this.worldWidth = this.cameras.main.displayWidth;
        this.worldHeight = this.cameras.main.displayHeight;

        const width = this.worldWidth;
        const height = this.worldHeight;

        this.owner = this.scene.get(SceneID.TestScene) as TestScene;
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.debugInfo = this.add.text(20, height - 130, "<You will not see this text", {
            fontSize: "30px", fontFamily: "Regular",
        });

        console.log();
        //Game.Content.Wallets.Gold.Add(10000);

        this.playerHealthBar = new ProgressBar({
            pos: new Vector2(width / 2, height - 100),
            size: new Size(250, 40),
            scene: this,
            fillColor: Color.HexStringToColor("#be3333")
        })

        this.upgradesMenu = new GameLayer(this);

        this.upgradesButton = new GameButton({
            scene: this,
            size: new Size(220, 60),
            pos: new Vector2(width - 220/2 - 10, 10 + 60/2),
            text: "Upgrades",
            enabled: true,
            onClick: () => {
                this.upgradesMenu.setVisible(!this.upgradesMenu.layer.visible);
            },
            textConfig: GUIStyles.Game.MenuButton.Text,
            buttonConfig: {
                color: Color.HexStringToColor("#717171"),
                onMouseOverColor: Color.HexStringToColor("#909090"),
            },
        });

        {
            const iconSize = new Size(48, 48);

            this.coinsCounter = {
                icon: this.add.image(10, 10, TextureId.WalletsCoin, 0),
                text: this.add.text(10 + iconSize.width + 10, 10, "You picked the wrong house, fool", GUIStyles.Game.WalletText),
                back: this.add.rectangle(5, 5, iconSize.width, iconSize.height,
                    Phaser.Display.Color.HexStringToColor("#000000").color, 0.4),
            }

            this.coinsCounter.icon.setOrigin(0, 0);
            this.coinsCounter.icon.setDisplaySize(iconSize.width, iconSize.height);

            this.coinsCounter.text.depth = 1;

            this.coinsCounter.back.setOrigin(0, 0);
            this.coinsCounter.back.setDepth(-1);
        }

        {
            this.waveCounter = {
                text: this.add.text(width/2, 10, "Wave: 666", GUIStyles.Game.WalletText),
                back: this.add.rectangle(width/2, 5, 240, 60,
                    Phaser.Display.Color.HexStringToColor("#000000").color, 0.4),
            }
            this.waveCounter.text.setOrigin(0.5, 0);
            this.waveCounter.text.depth = 1;

            this.waveCounter.back.setOrigin(0.5, 0);
            this.waveCounter.back.setDepth(-1);
        }

        this.speedUpgradeInfo = new UpgradeInfo({
            size: new Size(280, 200),
            scene: this,
            pos: new Vector2(width - 280 - 20, 20 + this.upgradesButton.height + 10),
            depth: 1,
            lang: {
                upgradeName: "Speed",
                upgradeDescription: "Player speed!"
            },
            upgrade: Game.Content.player.upgrades.speed,
        })

        this.reloadTimeUpgradeInfo = new UpgradeInfo({
            size: new Size(280, 200),
            scene: this,
            pos: new Vector2(width - 280 - 20, 20 + 20 + 200 + this.upgradesButton.height + 10),
            depth: 1,
            lang: {
                upgradeName: "Reloading",
                upgradeDescription: "Weapon reload duration!"
            },
            upgrade: Game.Content.player.upgrades.reloadTime,
        })

        this.upgradesMenu.add([ this.speedUpgradeInfo, this.reloadTimeUpgradeInfo ]);
        this.upgradesMenu.setVisible(false);

        Game.Engine.Loading.restartToLoadCallback = (loadManger => {
            Game.Engine.Reset();
            Game.Engine.ResetContent();
            this.owner.scene.restart();
        })
        this.resetButton = new GameButton({
            scene: this,
            size: new Size(220, 80),
            pos: new Vector2(width - 600, height - 80),
            text: "Reset",
            enabled: true,
            onClick: () => {
                Game.Engine.Loading.SkipNextLoad();
                Game.Engine.Loading.RestartToLoad();
            },
            textConfig: GUIStyles.Game.MenuButton.Text,
            buttonConfig: GUIStyles.Game.MenuButton.Button,
        });

        this.saveButton = new GameButton({
            scene: this,
            size: new Size(220, 80),
            pos: new Vector2(this.resetButton.x + 220 + 20, height - 80),
            text: "Save",
            onClick: () => {
                Game.Engine.Saving.SaveGame();
            },
            textConfig: GUIStyles.Game.MenuButton.Text,
            buttonConfig: GUIStyles.Game.MenuButton.Button,
        });

        this.loadButton = new GameButton({
            scene: this,
            size: new Size(220, 80),
            pos: new Vector2(this.saveButton.x + 220 + 20, height - 80),
            text: "Load",
            onClick: () => {
                Game.Engine.Loading.LoadGameFromSlot(LoadType.Manual);
            },
            textConfig: GUIStyles.Game.MenuButton.Text,
            buttonConfig: GUIStyles.Game.MenuButton.Button,
        });

        Game.Content.wallets.Gold.Add(2.5);
        this.upgradeButtonTween = this.tweens.add({
            targets: this.upgradesButton,
            angle: 5,
            duration: 250,
            loop: -1,
            yoyo: true,
            paused: true
        })

        GameEvent.RegisterMultiple([
            Game.Content.wallets.Gold.Events.OnChanged,
            this.owner.player.getComponent(HealthComponent)?.events.onHealthModified!
        ], () => {
            this.updateUI();
        })

        this.updateUI();
    }

    private upgradeButtonTween!: Tween;

    update(time: number, delta: number): void {
        //todo use move to updateUI and call it manually instead

        const pointerPosition = MouseHelper.getMouseWorld(this.cameras.main);
        this.debugInfo.text = `Mouse: \n cam: ${Math.floor(this.owner.input.mousePointer.x)} x ${Math.floor(this.owner.input.mousePointer.y)}`
            + `\n world: ${Math.floor(pointerPosition.x)} x ${Math.floor(pointerPosition.y)}`;
    }

    updateUI() {
        this.coinsCounter.text.text = NumberToString(Game.Content.gameManager.Content.wallets.Gold.Value);
        this.coinsCounter.back.setSize(
            this.coinsCounter.text.width + 64 + 10 + 5,
            this.coinsCounter.icon.displayHeight + 10);

        this.speedUpgradeInfo.updateUI();
        this.reloadTimeUpgradeInfo.updateUI();

        const playerHealth = this.owner.player.getComponent(HealthComponent)!;
        this.playerHealthBar.progress = playerHealth.health / playerHealth.maxHealth! * 100;

        if (Game.Content.player.upgrades.speed.IsCanBuy(1) || Game.Content.player.upgrades.reloadTime.IsCanBuy(1)) {
            //todo ля, надо сделать нормальную систему стилей и возможность их менять удобно. а то получается
            // я могу в своих GUI объектах только в создании полноценно стиль указать, это тупо
            //this.upgradesButton.button.fillColor = GUIStyles.Game.UpgradeButton.Button.color?.color!;

            if (!this.upgradeButtonTween.isPlaying()) {
                this.upgradesButton.setAngle(-5);
                this.upgradeButtonTween.play();
            }
        }
        else {
            if (this.upgradeButtonTween.isPlaying()) {
                this.upgradeButtonTween.stop();
                this.upgradesButton.setAngle(0);
            }
        }

    }
}