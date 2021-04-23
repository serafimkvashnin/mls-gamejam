import Scene = Phaser.Scene;
import Vector2 = Phaser.Math.Vector2;
import Color = Phaser.Display.Color;
import Rectangle = Phaser.GameObjects.Rectangle;
import Pointer = Phaser.Input.Pointer;
import Size = Phaser.Structs.Size;
import {GUIContainer} from "../GUIContainer";
import {IHasType} from "../../utils/TypeCheck";
import {GUIContainerConfig} from "../GUIContainerConfig";
import { Float, RawFloat } from "../../../nerdEngine/data";

export type ProgressBarConfig = GUIContainerConfig & {
    progress?: number,
    fillColor: Color,
    fillAlpha?: number,
    strokeColor?: Color,
    backColor?: Color,
    onClick?: (progressBar: ProgressBar, pointer: Pointer) => void,
}

export class ProgressBar extends GUIContainer implements IHasType {
    public static readonly TYPE_NAME: string = "GUIContainer, ProgressBar";
    public readonly TYPE_NAME: string = ProgressBar.TYPE_NAME;

    /**
     * Progress 0-100
     */
    private _barBaseWidth: number;
    private _progress: number = 0;

    public readonly bar: Rectangle;
    public readonly frame: Rectangle;
    public readonly back: Rectangle;

    constructor(c: ProgressBarConfig) {
        super(c.scene, c.pos, c.size, c.enabled);

        let { width, height } = this;

        this.back = c.scene.add.rectangle(0, 0, 1, 1,
            c.backColor ? c.backColor.color : Color.HexStringToColor("#3d3d3d").color, 1);
        this.back.setOrigin(0.5, 0.5);

        this.bar = c.scene.add.rectangle(0, 0, 1, 1, c.fillColor.color, c.fillAlpha ?? 1);
        this.bar.setOrigin(0.5, 0.5);
        this._barBaseWidth = this.bar.width;

        this.frame = c.scene.add.rectangle(0, 0, 1, 1, 0x000, 0);
        this.frame.setOrigin(0.5, 0.5);
        this.frame.setStrokeStyle(2, c.strokeColor ? c.strokeColor.color : Color.HexStringToColor("#000").color);

        this.progress = c.progress ?? 0;

        this.add(this.back);
        this.add(this.bar);
        this.add(this.frame);

        this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1, 1), Phaser.Geom.Rectangle.Contains);
        if (c.onClick) {
            if (this.canAccess() && this.isEnabled() && this.visible) {
                this.on("pointerdown", (ptr: Pointer) => c.onClick!(this, ptr));
            }
        }

        this.updateMarkup();
    }

    updateMarkup(pos?: Phaser.Math.Vector2, size?: Phaser.Structs.Size): void {
        let { width, height } = this;

        this.input.hitArea = new Phaser.Geom.Rectangle(-width/2, -height/2, width, height);
        this.back.setPosition(-width/2, -height/2);
        this.back.setSize(width, height)

        this.bar.setPosition(-width/2, -height/2);
        this.bar.setSize(width, height);
        this._barBaseWidth = this.bar.width;

        this.frame.setPosition(-width/2, -height/2);
        this.frame.setSize(width, height);
    }

    get progress() {
        return this._progress;
    }

    /**
     * @param progress 0-100
     */
    set progress(progress: RawFloat) {
        if (!this.isEnabled()) return;

        progress = new Float(progress);
        this._progress = Phaser.Math.Clamp(progress.AsNumber, 0, 100);
        this.bar.width = this._barBaseWidth * this._progress / 100;
    }

    setEnabled(enabled: boolean): void {
        this._enabled = enabled;
    }

    setSize(width: number, height: number): this {
        super.setSize(width, height);
        this.updateMarkup();

        return this;
    }

    setDepth(depth: number): this {
        super.setDepth(depth);
        this.updateMarkup();

        return this;
    }
}