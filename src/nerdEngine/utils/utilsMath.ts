/**
 * @return {number}
 */
import {Float, RawFloat} from "../data";
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

/*
function CalculateBuy(money: number, level: number, priceFirst: number, priceChange: number, count: number, debug = false)
    : {spent: number, levels: number, price: number} {
    const result = {
        spent: 0,
        levels: 0,
        price: 0,
    };

    const oldUpgradesCost = GetSum(priceFirst, priceChange, level - 1);
    const totalSum = oldUpgradesCost + money;

    let canBuyCount;
    if (count < 0) {
        canBuyCount = GetSumN(priceFirst, priceChange, totalSum);
    } else {
        canBuyCount = Math.min(level - 1 + count, GetSumN(priceFirst, priceChange, totalSum));
    }

    const canBuyCost = GetSum(priceFirst, priceChange, canBuyCount);
    result.spent = canBuyCost - oldUpgradesCost);
    result.levels = canBuyCount - (level - 1));
    result.price = GetElement(priceFirst, priceChange, level + result.levels));

    if (result.levels > 0) {
        // lol
    } else {
        if (debug) console.log('Cant buy anything\n');
        result.levels = 0;
        result.price = 0;
        result.spent = 0;
    }

    return result;
}

function GetSumN(a: number, d: number, s: number): number {
    const x11 = Math.pow(2 * a - d, 2);
    const x12 = (8 * d * s);
    const x1 = x11 + x12;
    const x2 = 2 * a - d;
    const x3 = 2 * d;
    return Math.floor((Math.sqrt(x1) - x2) / x3);
}

function GetSum(a: number, d: number, n: number): number {
    return ((2 * a + d * (n - 1)) / 2) * n;
}

function GetElement(a: number, d: number, n: number): number {
    return a + d * (n - 1);
}

function GetSumInterval(a: number, d: number, n1: number, n2: number): number {
    const s1 = ((2 * a + d * ((n1 - 1) - 1)) / 2) * (n1 - 1);
    const s2 = ((2 * a + d * (n2 - 1)) / 2) * n2;
    return s2 - s1;
}
*/


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

export function GetElapsedTimeMs(duration: Time | number, date1: Date, date2: Date = new Date()): number {
    if (typeof duration == "number") {
        duration = Time.FromMs(duration);
    }

    let diff = GetDateDifferenceMs(date1, date2);
    return duration.TotalMs.Minus(diff).AsNumber;
}

export function GetDateDifferenceTime(date1: Date | string, date2?: Date | string): Time {
    if (!date2) date2 = new Date();
    if (typeof date1 == "string") date1 = new Date(date1);
    if (typeof date2 == "string") date2 = new Date(date2);

    return Time.FromMs(Math.abs(date2.getTime() - date1.getTime()));
}