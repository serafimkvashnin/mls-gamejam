import Container = Phaser.GameObjects.Container;
import Vector2 = Phaser.Math.Vector2;
import Scene = Phaser.Scene;
import GameObject = Phaser.GameObjects.GameObject;
import Size = Phaser.Structs.Size;
import Pointer = Phaser.Input.Pointer;
import Point = Phaser.Geom.Point;
import {IHasType} from "../utils/TypeCheck";
import {GUI} from "./GUI";
import IGUIElement = GUI.IGUIElement;
import { EventHandlerComponent } from "./eventHandler/EventHandlerComponent";

//todo origins of rectangles are pretty confusing. phaser mostly uses 0 x 0 (but no always), im using 0.5 x 0.5
// everywhere... ugh

export type GUIContainerOptions = {
    ignoreMask?: boolean,
    ignoreScrollContainer?: boolean
}

export abstract class GUIContainer extends Container implements IGUIElement, IHasType {

    public static TYPE_NAME = "GUIContainer";
    public readonly TYPE_NAME = GUIContainer.TYPE_NAME;

    public readonly eventController: EventHandlerComponent;
    public static events = {
        enableStateChanged: "enableStateChanged",
        visibilityStateChanged: "visibilityStateChanged",
    }

    public readonly basePosition: Vector2;
    public readonly baseSize: Size;

    protected _canAccess: boolean;
    protected _enabled: boolean;
    protected _maskRect: Phaser.Geom.Rectangle | null;
    protected _ready: boolean;
    protected _ignoreMask: boolean;
    protected _ignoreScrollContainer: boolean;

    protected constructor(scene: Scene, pos: Vector2, size: Size, enabled: boolean = true, children: GameObject[] = [], options?: GUIContainerOptions)
    {
        super(scene, pos.x, pos.y, children);
        super.setSize(size.width, size.height);
        this.basePosition = pos;
        this.baseSize = size;
        this._enabled = enabled;
        this._canAccess = true;
        this._maskRect = null;
        options = options ?? {};
        this._ignoreMask = options.ignoreMask ?? false;
        this._ignoreScrollContainer = options.ignoreScrollContainer ?? false;

        scene.add.existing(this);

        this.eventController = new EventHandlerComponent(GUIContainer.events);
        this._ready = true;
    }

    get ignoreMask() {
        return this._ignoreMask;
    }

    get ignoreScrollContainer() {
        return this._ignoreScrollContainer;
    }

    isReady() {
        return this._ready;
    }

    resetPosition() {
        this.setPosition(this.basePosition.x, this.basePosition.y);
    }

    resetSize() {
        this.setSize(this.baseSize.width, this.baseSize.height);
    }

    getMaskRect(): Phaser.Geom.Rectangle | null {
        return this._maskRect;
    }

    setMask(mask: Phaser.Display.Masks.BitmapMask | Phaser.Display.Masks.GeometryMask): this {
        if (this._ignoreMask) return this;

        return super.setMask(mask);
    }

    setMaskRect(rect: Phaser.Geom.Rectangle | null): void {
        if (this._ignoreMask) return;

        this._maskRect = rect;
        //todo do same thing everywhere
        for (const child of this.getAll()) {
            if ("setMaskRect" in child) {
                (<any>child)?.setMaskRect(rect);
            }
        }
    }

    isInMask(returnIfMastNotSet: boolean = true) {
        if (this._maskRect) {
            return (Phaser.Geom.Rectangle.ContainsRect(
                this._maskRect,
                new Phaser.Geom.Rectangle(this.x - this.width/2, this.y - this.height/2, this.width, this.height)));
        }
        else {
            return returnIfMastNotSet;
        }
    }

    isPointerInMask(pointer?: Pointer, returnIfMaskNotSet: boolean = true) {
        if (this._maskRect) {
            if (!pointer) {
                pointer = this.scene.input.mousePointer;
            }

            return (Phaser.Geom.Rectangle.ContainsPoint(
                this._maskRect,
                new Point(pointer.x, pointer.y)));
        }
        else {
            return returnIfMaskNotSet;
        }
    }

    getSize(): Size {
        return new Size(this.width, this.height);
    }

    setSize(width?: number | undefined, height?: number | undefined): this {
        super.setSize(width ?? this.width, height ?? this.height)
        this.updateMarkup();

        return this;
    }

    isEnabled(): boolean {
        return this._enabled;
    }

    setEnabled(enabled: boolean): void {
        //this.eventController.callEvent(GUIContainer.events.enableStateChanged, this, enabled);
        this._enabled = enabled;
    }

    //todo maybe a little confusing name, but i didn't think off any better alternative right now
    canAccess(): boolean {
        return this._canAccess;
    }

    setAccess(enabled: boolean): void {
        this._canAccess = enabled;
    }

    canAccessInput(checks?: {
        isEnabled?: boolean,
        canAccess?: boolean,
        isPointerInMask?: boolean,
        isVisible?: boolean,
    }) {
        if (!checks) {
            return this.isEnabled() && this.canAccess() && this.isPointerInMask() && this.visible;
        }

        let isEnabled = true;
        if (typeof checks.isEnabled == "undefined" || checks.isEnabled) {
            isEnabled = this.isEnabled();
        }

        let isVisible = true;
        if (typeof checks.isVisible == "undefined" || checks.isVisible) {
            isVisible = this.visible;
        }

        let canAccess = true;
        if (typeof checks.canAccess == "undefined" || checks.canAccess) {
            canAccess = this.canAccess();
        }

        let isPointerInMask = true;
        if (typeof checks.isPointerInMask == "undefined" || checks.isPointerInMask) {
            isPointerInMask = this.isPointerInMask();
        }

        return  isEnabled && isVisible && canAccess && isPointerInMask;
    }

    getBounds(output?: Phaser.Geom.Rectangle): Phaser.Geom.Rectangle {
        return super.getBounds(output);
    }


    setVisible(value: boolean): this {
        //this.eventController.callEvent(GUIContainer.events.visibilityStateChanged, this, value);
        return super.setVisible(value);
    }

    abstract updateMarkup(): void
}
