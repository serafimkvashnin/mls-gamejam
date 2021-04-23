//
// import Scene = Phaser.Scene;
// import Vector2 = Phaser.Math.Vector2;
// import Text = Phaser.GameObjects.Text;
// import Rectangle = Phaser.GameObjects.Rectangle;
// import Size = Phaser.Structs.Size;
// import Color = Phaser.Display.Color;
// import IGUIPrefab = GUI.IGUIContainer;
//
// export type UpgradeInfoConfig = {
//     scene: Scene,
//     pos: Vector2,
//     size: Size,
//     upgrade: Upgrade,
//     depth: number,
//     backColor?: Color,
//     lang: { //todo api for lang updating
//         upgradeName: string,
//         upgradeDescription: string,
//     },
// };
//
// //todo figure out a better depth system
// export class UpgradeInfo extends GUIContainer implements IGUIPrefab {
//
//     public style = GUIStyles.GameMap;
//     public readonly upgrade: Upgrade;
//
//     public readonly titleText: Text;
//     public readonly text: Text;
//     public readonly button: GameButton;
//     public readonly back: Rectangle;
//
//     private _config: UpgradeInfoConfig;
//     private _depth: number;
//
//     //todo read more about jsdoc to make nice docs here
//     constructor(c: UpgradeInfoConfig) {
//         super(c.scene, c.pos, c.size);
//         this._config = c;
//         this.upgrade = c.upgrade;
//         this._depth = c.depth;
//
//         this.titleText = this.scene.add.text(0, 0, "####", this.style.UpgradeInfoTitleText);
//         this.titleText.setDepth(this._depth + 0.3);
//         this.titleText.setOrigin(0.5, 0.5);
//         this.titleText.setMaxLines(1);
//
//         this.text = this.scene.add.text(0, 0, "####", this.style.UpgradeInfoText);
//         this.text.setDepth(this._depth + 0.2);
//         this.text.setOrigin(0.5, 0.5);
//
//         this.button = new GameButton({
//             scene: this.scene,
//             text: "000$",
//             depth: 1,
//             pos: new Vector2(),
//             size: new Size(),
//             buttonConfig: this.style.UpgradeButton.Button,
//             textConfig: this.style.UpgradeButton.Text,
//
//             onClick: () => {
//                 c.upgrade.Buy(1);
//                 this.updateUI();
//             }
//         })
//         this.button.setDepth(this._depth + 0.1); //todo move depth setting to setupUI();
//
//         this.back = this.scene.add.rectangle(0, 0, 0, 0,
//             c.backColor ? c.backColor.color : Color.HexStringToColor("#fff").color, 0.2);
//
//         this.back.setOrigin(0, 0);
//         this.back.setDepth(this._depth - 0.1);
//         this.back.setStrokeStyle(2, 0x000, 0.5);
//
//         this.add([this.back, this.titleText, this.text, this.button]);
//         c.scene.add.existing(this);
//
//         this.updateMarkup();
//     }
//
//     updateMarkup(): void {
//         let {width, height} = this;
//
//         //todo do here better Y job, make it dynamic and related to prefab size
//
//         this.titleText.setPosition(width / 2, 15);
//         this.titleText.setSize(width, 20);
//
//         this.text.setPosition(width / 2, 45);
//         this.text.setSize(width, 20);
//
//         this.button.setPosition(this.width / 2, this.style.UpgradeButton.DefaultSize.height / 2 + 70);
//         this.button.setSize(this.style.UpgradeButton.DefaultSize.width, this.style.UpgradeButton.DefaultSize.height)
//
//         this.back.setPosition(0, 0);
//         this.back.setSize(width, height);
//     }
//
//     updateUI() {
//         this.titleText.text = `${this._config.lang.upgradeName}`;
//
//         let tweakType = this.upgrade.Tweaks[0].ValueType;
//         let valueBefore = this.getValueText(this.upgrade.GUI.GetTweakDataValue(0, 0), tweakType);
//         let valueAfter = this.getValueText(this.upgrade.GUI.GetTweakDataValueOnLevel(0, 0, 1), tweakType);
//
//         this.text.text = `${valueBefore} -> ${valueAfter}`;
//
//         this.button.setEnabled(this.upgrade.IsCanBuy());
//         this.button.text.text = `${GetNumberString(this.upgrade.GUI.GetPriceValue(0))}$`;
//     }
//
//     //todo temporary here, make global
//     private getValueText(value: INumber, type: TweakValueType) {
//         value = new Float(value);
//         let valueText = "";
//         switch (type) {
//             case TweakValueType.Default:
//                 valueText = GetNumberString(value);
//                 break;
//             case TweakValueType.TimeInMs:
//                 valueText = GetTimeText(value);
//                 break;
//             case TweakValueType.Multiplier:
//                 valueText = `x${GetNumberString(value)}`;
//                 break;
//             case TweakValueType.Percent:
//                 valueText = `${GetNumberString(value)}%`;
//                 break;
//         }
//
//         return valueText;
//     }
//
//     setDepth(depth: number): this {
//         super.setDepth(depth);
//         this.updateMarkup();
//
//         return this;
//     }
// }
