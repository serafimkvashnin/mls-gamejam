import { Game } from "../../../app";
import { RangeWeapon } from "../../entities/weapons/range/RangeWeapon";
import { TestSceneUI } from "./TestSceneUI";
import { SceneID } from "../../managers/registers/SceneID";
import { GameScene } from "./GameScene";
import { MusicId, TextureId } from "../../managers/registers/ResourceRegister";
import Color = Phaser.Display.Color;
import Vector2 = Phaser.Math.Vector2;

export class TestScene extends GameScene {
    private ui!: TestSceneUI;

    constructor() {
        super(SceneID.TestScene);
    }

    create() {
        super.create();

        this.anims.createFromAseprite("player");
        this.anims.createFromAseprite("enemy");

        this.scene.launch(SceneID.TestSceneUI);
        this.ui = this.scene.get(SceneID.TestSceneUI) as TestSceneUI;

        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#329041");

        this.player.weapon = new RangeWeapon(this, Game.Content.weapons.pistol, this.player, this.projectileGroup);

        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.spawnEnemyAtRandomPosition(), i * 1000);
        }

        this.enemyGroup.onAnyoneDeath.Register(() => setTimeout(() => this.spawnEnemyAtRandomPosition(), 1000));

        let egg = this.add.image(this.pan.x - 100, this.pan.y, TextureId.WalletsCoin).setScale(0.5, 0.5);

        let graphics = this.add.graphics();
        let path = new Phaser.Curves.Path(egg.x, egg.y);
        path.ellipseTo(10, 25, 0, -90, true, 0)
        path.ellipseTo(10, 25, -90, -180, true, 0)

        path.draw(graphics);

        (<any>egg).t = 0;
        let tween = this.tweens.add({
            targets: egg,
            t: 1,
            onUpdate: () => {
                let pos: Vector2 = new Vector2();
                path.getPoint((<any>egg).t, pos);
                egg.x = pos.x;
                egg.y = pos.y;
            },
            duration: 1000,
            paused: true,
            ease: "Cubic.easeOut",
        })

        this.time.delayedCall(1000, () => {
            tween.play();
        })
    }
}