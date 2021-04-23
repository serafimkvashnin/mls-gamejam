import { IHasType } from "../utils/TypeCheck";
import { GUIContainer } from "./GUIContainer";
import { GUIContainerConfig } from "./GUIContainerConfig";
import Pointer = Phaser.Input.Pointer;
import Color = Phaser.Display.Color;
import Clamp = Phaser.Math.Clamp;

export type SliderConfig = GUIContainerConfig & {
    minValue?: number,
    maxValue?: number,
    value?: number,
    cursorRadius?: number,
}

//todo click on the back to move slider to click position

export class Slider extends GUIContainer implements IHasType {

    public static events = {
        ...GUIContainer.events,
        onDrag: "onDrag",
    }

    public static readonly TYPE_NAME: string = "GUIContainer, Slider";
    public readonly TYPE_NAME: string = Slider.TYPE_NAME;

    private readonly _minValue: number;
    private readonly _maxValue: number;

    private _value: number;
    private _completionValue: number;

    public readonly topY: number;
    public readonly bottomY: number;

    public readonly back: Phaser.GameObjects.Rectangle;
    public readonly cursor: Phaser.GameObjects.Rectangle;

    constructor(c: SliderConfig) {
        super(c.scene, c.pos, c.size, c.enabled, [], c.options);

        const { x, y } = c.pos;
        const { width, height } = c.size;

        this._minValue = c.minValue ?? 0;
        this._maxValue = c.maxValue ?? 100;
        this._value = c.value ? Clamp(c.value, this._minValue, this._maxValue) : 0;
        this._completionValue = 0;
        c.cursorRadius = c.cursorRadius ?? 16;

        this.back = this.scene.add.rectangle(0, 0, width, height);
        this.back.setFillStyle(Color.HexStringToColor("#393939").color, 1);
        this.back.setOrigin(0.5, 0.5);

        this.cursor = this.scene.add.rectangle(0, 0, width * 0.8, width * 0.8);
        this.cursor.setFillStyle(Color.HexStringToColor("#fff").color, 1);
        this.cursor.setOrigin(0.5, 0.5);

        this.topY = this.back.getBounds().top + this.width/2;
        this.bottomY = this.back.getBounds().bottom - this.width/2;

        this.cursor.setInteractive();
        this.back.setInteractive();

        this.scene.input.setDraggable(this.cursor);
        this.cursor.on("dragstart", (pointer: Pointer) => {
            this.cursor.fillColor = Color.HexStringToColor("#69e4ff").color;
        })

        this.cursor.on("dragend", (pointer: Pointer) => {
            this.cursor.fillColor = Color.HexStringToColor("#fff").color;
            //console.log(`percent: ${this._completionValue * 100}%\nvalue: ${this.getValue()}`);
        })

        this.cursor.on("drag", (pointer: Pointer, dragX: number, dragY: number) => {
            this.onDrag(dragY);
        })


        this.back.on('wheel', (pointer: Pointer, currentlyOver: boolean, dx: number, dy: number) => {
            //todo i have no idea, why in one object, we have to use dy, and in others we have to use dx. wtf?
            this.onDrag(this.cursor.y + dx / 10);
            //SPECIFICALLY here, dy is always zero, and we get values through dx
            // even though in other 'wheel' events we get the value in dy property
        });

        this.cursor.on('wheel', (pointer: Pointer, currentlyOver: boolean, dx: number, dy: number) => {
            this.onDrag(this.cursor.y + dx / 10);
        });

        this.add([
            this.back, this.cursor,
        ]);

        this._completionValue = (this._value - this._minValue) / (this._maxValue - this._minValue);
        this.updateCursor();
    }

    drag(offsetY: number) {
        this.onDrag(this.cursor.y + offsetY);
    }

    private onDrag(dragY: number) {
        this.cursor.y = Clamp(dragY, this.topY, this.bottomY);
        this._completionValue = (this.cursor.y - this.topY) / (this.bottomY - this.topY);
        this.updateValue();
        this.eventController.callEvent(Slider.events.onDrag, this, {});
    }

    private updateValue() {
        this._value = this._minValue + (this._completionValue) * (this._maxValue - this._minValue);
    }

    /**
     * Slider scrolling completeness value, from 0 to 1
     */
    getScrollCompleteness() {
        return Clamp(this._completionValue, 0, 1);
    }

    getValue() {
        return this._value;
    }

    getRelativeCursorY() {
        return Clamp(this.topY + ((this.bottomY - this.topY) * this.getScrollCompleteness()), this.topY, this.bottomY);
    }

    private updateCursor() {
        this.cursor.y = this.getRelativeCursorY();
    }

    updateMarkup(): void {

    }

    setVisible(value: boolean): this {
        console.log(`set visible (${value})`);
        return super.setVisible(value);
    }
}