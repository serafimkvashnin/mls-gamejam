import {Float, RawFloat, RawFloatValue} from "../data";
import { MersenneTwister19937, Random } from "random-js";

//todo передавать в методе/классе объект рандома
export class RandomUtils {

    private static random: any = new Random(MersenneTwister19937.autoSeed());

    /**
     * @param chance 0-100
     * @param count
     * @return Returns count of happened events
     */
    static BoolCount(chance: RawFloat, count: RawFloat): number {
        chance = RawFloatValue(chance);
        count = RawFloatValue(count);

        let happened = 0;
        for (let i = 0; i < count; i++) {
            happened += RandomUtils.random.bool(chance / 100) ? 1 : 0;
        }
        return happened;
    }

    /**
     * @param chance 0-100
     */
    static Bool100(chance: RawFloat) {
        return RandomUtils.random.bool(new Float(chance).Divide(100).AsNumber);
    }

    /**
     * @param chance 0-1
     */
    static Bool1(chance: RawFloat) {
        return RandomUtils.random.bool(new Float(chance).AsNumber);
    }
}