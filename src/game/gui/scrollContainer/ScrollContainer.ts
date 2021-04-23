import {GUIContainer} from "../GUIContainer";
import GameObject = Phaser.GameObjects.GameObject;
import Transform = Phaser.GameObjects.Components.Transform;
import Size = Phaser.Structs.Size;
import Scene = Phaser.Scene;
import Vector2 = Phaser.Math.Vector2;
import Rectangle = Phaser.GameObjects.Rectangle;
import Color = Phaser.Display.Color;
import GetBounds = Phaser.GameObjects.Components.GetBounds;
import Pointer = Phaser.Input.Pointer;
import Graphics = Phaser.GameObjects.Graphics;
import GeometryMask = Phaser.Display.Masks.GeometryMask;
import Mask = Phaser.GameObjects.Components.Mask;
import {IsObjectOfType, IHasType} from "../../utils/TypeCheck";
import Depth = Phaser.GameObjects.Components.Depth;
import {Slider} from "../slider/Slider";

export type GUIContainerItem = GameObject & Transform & Mask & Depth & {
    width: number,
    height: number,
    x: number,
    y: number,
    getBounds(output?: Phaser.Geom.Rectangle): Phaser.Geom.Rectangle;
};

export type ScrollContainerConfig = {
    scene: Scene,
    position: Vector2,
    size: Size,
    children: GUIContainerItem[] | GUIContainerItem,
}

export class ScrollContainer extends GUIContainer implements IHasType {

    public static TYPE_NAME = "GUIContainer, ScrollContainer";
    public readonly TYPE_NAME = ScrollContainer.TYPE_NAME;

    //public frame: Rectangle;
    private readonly _scrollContainerChildren: { obj: GUIContainerItem, basePosition: Vector2 }[];
    public slider: Slider;

    private _contentTop: number = 0;
    private _contentBot: number = 0;

    private readonly _sliderOffsetX: number = 8;

    constructor(c: ScrollContainerConfig) {
        super(c.scene, c.position, c.size);

        this._scrollContainerChildren = [];
        c.children = Array.isArray(c.children) ? c.children : [ c.children ];

        let { x, y } = this;
        let { width, height } = this;

        //this.frame = this.scene.add.rectangle(0, 0, width, height);
        //this.frame.setFillStyle(Color.HexStringToColor("#f94fff").color, 0.2);
        //this.frame.setStrokeStyle(-2, Color.HexStringToColor("#f94fff").color);
        //this.add(this.frame);

        this.slider = new Slider({
            scene: this.scene,
            pos: new Vector2(100, 100),
            size: new Size(24, height),
            minValue: 0,
            maxValue: 100,
            cursorRadius: 16,
            options: {
                ignoreMask: true,
                ignoreScrollContainer: true,
            },
        })
        this.add(this.slider);

        this.slider.eventController.subscribe(Slider.events.onDrag, () => {
            this.updateOffset();
        });

        this.recomputeMask();
        this.addItemToScrollbar(c.children);
    }

    getScrollbarItems() {
        let children: GameObject[] = [];
        for (const item of this._scrollContainerChildren) {
            children.push(item.obj);
        }

        return children;
    }

    getFullScrollbarItems() {
        return this._scrollContainerChildren;
    }

    /**
     * Add child to this ScrollContainer
     * @param children
     */
    addItemToScrollbar(children: GUIContainerItem | GUIContainerItem[]): this {
        //todo how will we handle input from children?
        children = Array.isArray(children) ? children : [ children ];
        if (children.length == 0) return this;

        children.forEach(child => {
            this._scrollContainerChildren.push({
                obj:  child,
                basePosition: new Vector2(parseFloat("" + child.x), parseFloat("" + child.y))
            });
            this.updateChildrenMask(child);
        })

        this.updateValues();
        return this;
    }

    private recomputeMask() {
        // Problem here, that super() call of Phaser.GameObjects.Container calls setPosition, that calls recomputeMask,
        // but at this point, ScrollContainer isn't initiated yet, so this code will throw an error, so im using ready for this
        // @Felix

        if (!this.isReady()) return;

        let { x, y } = this;
        let { width, height } = this;

        const graphics = new Graphics(this.scene);
        let maskPos = new Vector2(x - width/2, y - height/2);
        let maskSize = new Size(width + this.slider.width/2 + this._sliderOffsetX, height);
        const mask = new GeometryMask(this.scene, graphics.fillRect(maskPos.x, maskPos.y, maskSize.width, maskSize.height));
        const maskRect = new Phaser.Geom.Rectangle(maskPos.x, maskPos.y, maskSize.width, maskSize.height);
        this.setMask(mask);
        this.setMaskRect(maskRect);
        this.updateChildrenMask();
    }

    private updateChildrenMask(children?: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        if (!children) children = this.getScrollbarItems() ?? [];
        children = Array.isArray(children) ? children : [ children ];

        for (const child of children) {
            (<any>child).setMask(this.mask);
            (<any>child).setMaskRect(this._maskRect);
        }
    }

    get viewport() {
        return this.getMaskRect()!;
    }

    get offsetY(): number {
        return (this._contentBot - this.viewport.bottom + 10) * this.slider.getScrollCompleteness();
    }

    private updateValues() {
        if (this._scrollContainerChildren.length == 0) {
            return;
        }

        let sortByTop = this._scrollContainerChildren.sort((a, b) => a.obj.getBounds().top - b.obj.getBounds().top);
        let sortByBot = this._scrollContainerChildren.sort((a, b) => b.obj.getBounds().bottom - a.obj.getBounds().bottom);

        this._contentTop = sortByTop[0].obj.getBounds().top;
        this._contentBot = sortByBot[0].obj.getBounds().bottom;
    }

    setPosition(x?: number, y?: number, z?: number, w?: number): this {
        super.setPosition(x, y, z, w);
        this.recomputeMask();
        this.updateMarkup();

        return this;
    }

    setSize(width?: number | undefined, height?: number | undefined): this {
        super.setSize(width, height);
        this.recomputeMask();

        return this;
    }

    updateMarkup() {
        if (!this._ready) return;

        const { x, y, width, height } = this;

        this.slider.setSize(24, height);
        this.slider.setPosition(width / 2 + this._sliderOffsetX, 0);
    }

    updateOffset() {
        for (const info of this.getFullScrollbarItems()) {

            const child = info.obj;

            if (IsObjectOfType(child, GUIContainer.TYPE_NAME)) {
                const guiItem = child as GUIContainer;
                if (guiItem.ignoreScrollContainer) {
                    continue;
                }
            }

            child.y = info.basePosition.y - this.offsetY;
        }
    }
}