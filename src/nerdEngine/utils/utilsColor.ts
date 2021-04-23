import {interpolateRgb} from "d3-interpolate";
import {rgb} from "d3-color";

export type RGB = { r: number, g: number, b: number };
export type RGB255 = { r255: number, g255: number, b255: number };
export type C3Color = [number, number, number];
export type HEXColor = string;

export function ExternalRGB255ToCurrentRGB255(rgb: RGB | { R: number, G: number, B: number}): RGB255 {
    return {
        r255: "r" in rgb ? rgb.r : rgb.R,
        g255: "g" in rgb ? rgb.g : rgb.G,
        b255: "b" in rgb ? rgb.b : rgb.B,
    }
}

export function RGBToC3Color(color: RGB): C3Color {
    return [color.r, color.g, color.b];
}

export function RGB255ToC3Color(color: RGB255): C3Color {
    return [color.r255 / 255, color.g255 / 255, color.b255 / 255];
}

export function InterpolateColors(color1: string, color2: string, progress: number): RGB255 {
    const colorValue = interpolateRgb(color1, color2)(progress / 100)
    return ExternalRGB255ToCurrentRGB255(rgb(colorValue));
}