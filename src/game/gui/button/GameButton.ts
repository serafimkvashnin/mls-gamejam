import Scene = Phaser.Scene;
import Vector2 = Phaser.Math.Vector2;
import Color = Phaser.Display.Color;
import TextStyle = Phaser.GameObjects.TextStyle;
import Pointer = Phaser.Input.Pointer;
import Rectangle = Phaser.GameObjects.Rectangle;
import Size = Phaser.Structs.Size;
import Text = Phaser.GameObjects.Text;
import GameObject = Phaser.GameObjects.GameObject;
import {IHasType} from "../../utils/TypeCheck";
import {GUIContainerConfig} from "../GUIContainerConfig";
import {GUIContainer} from "../GUIContainer";

export type ButtonConfig = {
    color?: Color,
    alpha?: number,
    disabledColor?: Color,
    onMouseOverColor?: Color,
    onMouseOverAlpha?: number,
    borderWidth?: number,
}

export type TextConfig = {
    size?: number,
    font?: string,
    color?: Color,
    style?: TextStyle,
}

export type GameButtonConfig = GUIContainerConfig & {
    scene: Scene,
    text: string,
    pos: Vector2,
    size: Size,
    //origin?: Vector2, //todo implement
    buttonConfig?: ButtonConfig,
    textConfig?: TextConfig,
    onClick: (button: GameButton, pointer: Pointer) => void,
}

//todo icon on button
export class GameButton extends GUIContainer implements IHasType {
    public static readonly TYPE_NAME: string = `${GUIContainer.TYPE_NAME}, GameButton`;
    public readonly TYPE_NAME: string = GameButton.TYPE_NAME;

    private readonly _color: number;
    private readonly _disabledColor: number;

    public readonly button: Phaser.GameObjects.Rectangle;
    public readonly text: Phaser.GameObjects.Text;

    private _visualState: "enabled" | "disabled" | "mouseOver";

    constructor(c: GameButtonConfig) {
        super(c.scene, c.pos, c.size, c.enabled, [], c.options);

        if (!c.buttonConfig) c.buttonConfig = {}
        if (!c.textConfig) c.textConfig = {
            size: 16,
        }

        this._visualState = c.enabled ? "enabled" : "disabled";

        this._color = c.buttonConfig.color ? c.buttonConfig.color.color : Color.HexStringToColor("#fff").color;
        this._disabledColor = c.buttonConfig.disabledColor ? c.buttonConfig.disabledColor.color : Color.HexStringToColor("#b36262").color;

        let depth = c.depth ?? 0;
        let alpha = c.buttonConfig.alpha ?? 1;
        let overColor = c.buttonConfig.onMouseOverColor ? c.buttonConfig.onMouseOverColor.color : Color.HexStringToColor("#58ea8f").color;
        let overAlpha = c.buttonConfig.onMouseOverAlpha ?? 1;
        let origin = new Vector2(0.5, 0.5); //todo c.origin ?? new Vector2(0.5, 0.5);

        let textColor = c.textConfig.color ? c.textConfig.color.rgba : Color.HexStringToColor("#000").rgba;
        let textSize = c.textConfig.size ?? 16;

        this.button = c.scene.add.rectangle(0, 0, 1, 1, this._color, alpha);
        this.button.setOrigin(origin.x, origin.y);

        let strokeWidth = c.buttonConfig.borderWidth ?? 2;
        this.button.setStrokeStyle(strokeWidth, Color.HexStringToColor("#000").color)

        let style: Phaser.Types.GameObjects.Text.TextStyle = c.textConfig.style ?? {};
        style.fontFamily = c.textConfig.font ?? "Regular";
        style.fontSize = `${textSize}px`;
        style.color = textColor;

        this.text = c.scene.add.text(0, 0, c.text, style);
        this.text.setAlign("center");
        this.text.setOrigin(origin.x, origin.y);

        // this.frame = c.scene.add.rectangle(1, 1, 1, 1);
        // this.frame.setFillStyle(Color.HexStringToColor("#00ffab").color, 0.5);

        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1, 1), Phaser.Geom.Rectangle.Contains);
        this.on("pointerdown", (pointer: Pointer, objects: GameObject[]) => {
            if (this.canAccessInput()) c.onClick(this, pointer)
        });

        this.on('pointerover', () => {
            if (this.canAccessInput({isPointerInMask: false})) {
                this.button.fillAlpha = overAlpha;
                this.button.fillColor = overColor;

                this._visualState = "mouseOver";
            }
        });
        this.on('pointerout', () => {
            if (this._visualState == "mouseOver") {
                this.button.fillAlpha = alpha;
                this.button.fillColor = this._color;

                this._visualState = this._enabled ? "enabled" : "disabled";
            }
        });

        this.setEnabled(c.enabled ?? true);

        this.add(this.button);
        this.add(this.text);
        //this.add(this.frame);

        this.updateMarkup();
    }

    //public frame: Rectangle;

    updateMarkup(): void {
        let {width, height} = this.getSize();

        this.input.hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
        this.button.setPosition(-width / 2, -height / 2);
        this.button.setSize(width, height)

        this.text.setPosition(0, 0);
        this.text.setSize(width, height);

        //let bounds = this.getBounds();
        //this.frame.setPosition(bounds.x, bounds.y);
        //this.frame.setSize(bounds.width, bounds.height);
    }

    setEnabled(value: boolean): void {
        super.setEnabled(value);

        if (value) this.button.fillColor = this._color;
        else this.button.fillColor = this._disabledColor;

        this._visualState = value ? "enabled" : "disabled";
    }

    getBounds(output?: Phaser.Geom.Rectangle): Phaser.Geom.Rectangle {
        return new Phaser.Geom.Rectangle(-this.width / 2, -this.height / 2, this.width, this.height);
    }

    //todo
    // setDepth(value: number): this {
    //     super.setDepth(value);
    //     this.setupUI();
    //     return this;
    // }
}
