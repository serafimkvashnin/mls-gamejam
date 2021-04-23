import { Notation } from "./notation";
import type Decimal from "break_infinity.s.js";
import { toFixedEngineering, abbreviate } from "./notationUtils";

export class StandardNotation extends Notation {
    public readonly name = "Standard";

    public formatDecimal(value: Decimal, places: number): string {
        const engineering = toFixedEngineering(
            value,
            places
        );
        const mantissa = engineering.mantissa.toFixed(places);
        const abbreviation = abbreviate(Math.floor(engineering.exponent / 3) - 1);
        return `${mantissa} ${abbreviation}`;
    }
}
