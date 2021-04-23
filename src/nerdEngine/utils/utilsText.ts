import {Float, RawFloat, RawFloatValue} from "../data";
import {Time} from "../data";
import {FractionalPart} from "./utilsMath";
import {StandardNotation} from "../math/numbers";

export function CurrentTimeStr(): string {
    const now = new Date();
    return `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}:${now.getMilliseconds()}]`
}

export function UpperFirstChar(str: string): string {
    if (str) {
        return `${str[0].toUpperCase()}${str.substring(1)}`;
    }
    else {
        throw new Error('String was empty');
    }
}

export function GetPropertyList(obj: object, depth = 1, showName = true) {
    let text = '';
    for (let property in obj) {
        if (obj.hasOwnProperty(property)) {
            let valueText = '';
            // @ts-ignore
            if (typeof obj[property] != 'object' && obj[property] !== null) {
                // @ts-ignore
                valueText = obj[property];
            } else {
                // @ts-ignore
                valueText += GetPropertyList(obj[property], 2);
            }
            const nameText = showName ? `${property}: ` : '';
            if (property != 'contentID' && property != 'varID' && property != 'lang') text += `\n${Whitespace(3 * depth)}[b]${nameText}[/b]${valueText}`;
        }
    }
    return text;
}

export function Whitespace(count: number): string {
    let str = '';
    for (let i = 0; i < count; i++)
        str += ' ';

    return str;
}

export function ParsePath(str: string): string[] {
    return str.split('.');
}

export function RemoveBBCode(text: string): string {
    return text.replace(/\[\/?(?:b|i|u|url|quote|code|img|color|size)*?.*?\]/img, '');
}

export function RemoveSlashN(text: string): string {
    return text.replace(/\n/g, '');
}

export function FormatTimeInSeconds(time: Time): string {
    let seconds = Float.Floor(time.TotalSeconds);
    let hours: Float;
    if (seconds.IsMoreOrEqual(3600)) {
        hours = Float.Floor(seconds.Divide(3600));
        seconds = Float.Minus(seconds, Float.Times(hours, 3600));
    } else hours = new Float(0);

    let minutes: Float;
    if (seconds.IsMoreOrEqual(60)) {
        minutes = Float.Floor(seconds.Divide(60));
        seconds = Float.Minus(seconds, Float.Times(minutes, 60));
    } else minutes = new Float(0);

    return FormatTime(hours, minutes, seconds);
}

export function FormatTime(hours: RawFloat, minutes: RawFloat, seconds: RawFloat) {
    hours = RawFloatValue(hours);
    minutes = RawFloatValue(minutes);
    seconds = RawFloatValue(seconds);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function NumberWithCommas(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//todo use Float instance function instead

export function ShortExpNumber(numStr: string): string {
    const before = "e+";
    const after = "e";
    return numStr.toString().replace(before, after);
}

export function GetLinesCount(str: string): number {
    return (str.match(/\n/g) || '').length + 1;
}


export type NumberNotation = "Scientific" | "Letter";

export function NumberToString(number: RawFloat, notation?: NumberNotation, floats: number = 2): string // notation: 1 - letter, 2 - scientific
{
    //todo Это реально тупо. Надо сделать промежуточный метод в движке или что
    //notation = Content.Settings.System.Notation.Value as NumberNotation;

    notation = notation ?? "Letter";

    const float = new Float(number);
    if (float.IsLess(1000)) {
        if (!FractionalPart(float.AsNumber).IsLess(0.1)) {
            return float.ToStringFixed(floats);
        }
        else {
            return float.ToStringFixed(0);
        }
    }
    else {
        if (notation == "Scientific") {
            const str = float.ToStringExtendedFixed(floats);
            const parts = str.split('+');
            const newSecondPart = NumberWithCommas(parseInt(parts[1]));
            return parts[0] + newSecondPart;
        }
        else {
            const letter = new StandardNotation();
            return letter.format(float.AsDecimal, floats, 0);
        }
    }
    //todo implement floats and notation settings
}

//todo ability to show only seconds, minutes and so on
export function TimeToString(timeOrMS: Time | RawFloat,
                             showOnlyTwo: boolean = true,
                             shortNames: boolean = true,
                             intSeconds: boolean = false,
                             shortNumbers: boolean = true,
                             notation: NumberNotation = "Letter"): string
{
    let seconds;
    if (timeOrMS instanceof Time) {
        seconds = timeOrMS.TotalSeconds;
    }
    else {
        timeOrMS = new Float(timeOrMS);
        seconds = timeOrMS.Divide(1000) ;
    }
    seconds = Float.Max(0, seconds);

    /*
    const centuries = Float.Floor(seconds.Divide(3153600000));
    seconds.DoMinus(Float.Times(centuries, 3153600000));
    const years = Float.Floor(seconds.Divide(31536000));
    seconds.DoMinus(Float.Times(years, 31536000));
    const months = Float.Floor(seconds.Divide(2629743));
    seconds.DoMinus(Float.Times(months, 2629743));
    const weeks = Float.Floor(seconds.Divide(604800));
    seconds.DoMinus(Float.Times(weeks, 604800));
    const days = Float.Floor(seconds.Divide(86400));
    seconds.DoMinus(Float.Times(days, 86400));
    */

    let numberToString = (n: RawFloat): string => {
        n = new Float(n);
        if (shortNumbers) {
            return NumberToString(n, notation);
        }
        else {
            if (n.IsLess(1000)) {
                return NumberToString(n, notation);
            }
            else {
                return n.ToStringFixed(0);
            }
        }
    };

    const hours = Float.Floor(seconds.Divide(3600));
    seconds = Float.Minus(seconds, Float.Times(hours, 3600));
    const minutes = Float.Floor(seconds.Divide(60));
    seconds = Float.Minus(seconds, Float.Times(minutes, 60));
    if (intSeconds) {
        seconds = seconds.Floor();
    }

    let text = '';

    const parts = [];


    //todo make days/weeks/etc optional
    /*
    text += (years > 0 ? `${years}y ` : '');
    text += (months > 0 ? `${months}mth ` : '');
    text += (weeks > 0 ? `${weeks}w ` : '');
    text += (days > 0 ? `${days}d ` : '');
    */

    let msStr = shortNames ? "ms" : (seconds.Divide(1000).Floor().IsEqual(1) ? " millisecond" : " milliseconds");
    let secondsStr = shortNames ? "s" : (seconds.IsEqual(1) ? " second" : " seconds");
    let minutesStr = shortNames ? "m" : (minutes.IsEqual(1) ? " minute" : " minutes");
    let hoursStr = shortNames ? "h" : (hours.IsEqual(1) ? " hour" : " hours");

    if (hours.IsMore(0)) {
        parts.push(hours.IsLess(1000) ? `${numberToString(hours)}${hoursStr} ` : `${numberToString(hours)} hours`);
    }

    if (minutes.IsMore(0) && hours.IsLess(1000)) {
        parts.push(`${numberToString(minutes)}${minutesStr} `);
    }

    if (seconds.IsMore(0) && hours.IsLess(1000)) {
        if (parts.length !== 0) {
            parts.push(`${numberToString(Float.Floor(seconds))}${secondsStr} `);
        }
        else {
            if (FractionalPart(seconds).IsNotEqual(0)) {
                parts.push(`${seconds.ToFixed(2)}${secondsStr} `);
            }
            else {
                parts.push(`${numberToString(Float.Floor(seconds))}${secondsStr} `);
            }
        }
    }

    if (seconds.IsLess(0)) {
        parts.push(`${numberToString(Float.Floor(seconds.Times(1000)))}${msStr} `);
    }

    for (let i = 0; i < parts.length; i++) {
        text += parts[i];

        if (showOnlyTwo && i === 1) {
            return text.trimEnd();
        }
    }

    return text.trimEnd();
}

export type HEXString = string;

export function LogColored(text: string, color: HEXString) {
    console.log(`%c${text}`, `color:${color}`);
}