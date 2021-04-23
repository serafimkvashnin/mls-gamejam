/**
 * @return {number}
 */
import { Float, RawFloat, Vector2 } from "../data";
import {RGB255} from "./utilsColor";
import {Time} from "../data";
import {Interval} from "../data";


export function __FixNumber(value: number): number {
    return Math.round(value * 1000000) / 1000000;
}

export function IsNumber(str: string) {
    return parseFloat(str).toString() === str;
}

//todo maybe move to Float
export function FractionalPart(n: RawFloat): Float {
    n = new Float(n);
    return n.Minus(n.Floor());
}

export function ComponentToHex(c: number): string {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function HexToRGB255(hex: string): RGB255 {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) return {
        r255: parseInt(result[1], 16),
        g255: parseInt(result[2], 16),
        b255: parseInt(result[3], 16)
    };
    else {
        throw new Error(`HEX color string was not correct: ${hex}`)
    }
}

export function HexToRGB(hex: string): { r: number, g: number, b: number } {
    const rgb = HexToRGB255(hex);
    return {
        r: (rgb.r255 / 255),
        g: (rgb.g255 / 255),
        b: (rgb.b255 / 255),
    }
}


export function HexToRGB255Array(hex: string): [number, number, number] {
    const rgb = HexToRGB255(hex);
    return [
        rgb.r255, rgb.g255, rgb.b255,
    ]
}

export function HexToRGBArray(hex: string): [number, number, number] {
    const rgb = HexToRGB255(hex);
    return [
        (rgb.r255 / 255), (rgb.g255 / 255), (rgb.b255 / 255),
    ]
}

export function GetFullNumberStr(x: number): string {
    let e;
    let output = '' + x;
    if (Math.abs(x) < 1.0) {
        e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            output = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            output += (new Array(e + 1)).join('0');
        }
    }
    return output;
}

export function Clamp(value: number, interval: Interval, inclusive: boolean = true): number {
    if (inclusive) {
        return Math.min(Math.max(value, interval.Min), interval.Max);
    }
    else {
        return Math.min(Math.max(value, interval.Min + interval.Step), interval.Max - interval.Step);
    }
}

export function GetDateDifferenceMs(date1: Date | string, date2: Date | string = new Date()): number {
    if (typeof date1 == "string") date1 = new Date(date1);
    if (typeof date2 == "string") date2 = new Date(date2);

    return Math.abs(date1.getTime() - date2.getTime())
}

export function GetElapsedTimeMs(durationMs: Time | number, date1: Date, date2: Date = new Date()): number {
    if (typeof durationMs == "number") {
        durationMs = Time.FromMs(durationMs);
    }

    let diff = GetDateDifferenceMs(date1, date2);
    return durationMs.TotalMs.Minus(diff).AsNumber;
}

export function GetDateDifferenceTime(date1: Date | string, date2?: Date | string): Time {
    if (!date2) date2 = new Date();
    if (typeof date1 == "string") date1 = new Date(date1);
    if (typeof date2 == "string") date2 = new Date(date2);

    return Time.FromMs(Math.abs(date2.getTime() - date1.getTime()));
}

export function TryParseInt(str: string, defaultValue: number) {
    let retValue = defaultValue;
    if (str !== null) {
        if (str.length > 0) {
            if (!isNaN(parseInt(str))) {
                retValue = parseInt(str);
            }
        }
    }
    return retValue;
}

export function Distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

export function DistanceVec(pos1: Vector2, pos2: Vector2) {
    return Math.sqrt((pos1.X - pos1.Y) ** 2 + (pos2.X - pos2.Y) ** 2);
}