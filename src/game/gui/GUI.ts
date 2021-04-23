import GameObject = Phaser.GameObjects.GameObject;
import Vector2 = Phaser.Math.Vector2;
import Size = Phaser.Structs.Size;

//todo im not sure how to do those separate interfaces in a good way

export namespace GUI {
    export interface IGUIElement {
        updateMarkup(): void;

        isEnabled(): boolean;
        setEnabled(enabled: boolean): void;

        getSize(): Size;
        setSize(width?: number, height?: number): void;
        getBounds(): Phaser.Geom.Rectangle;

        canAccess(): boolean;
        setAccess(value: boolean): void;
        // setDepth(depth: number): void; //todo make [number, number] instead to be sure about objects's depth
    }

    export interface IGUIContainer extends IGUIElement {
        updateUI(): void;

        setMaskRect(rect: Phaser.Geom.Rectangle | null): void;
    }
}