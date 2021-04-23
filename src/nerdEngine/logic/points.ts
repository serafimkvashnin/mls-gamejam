import {GameObject, ClassNames} from "./gameObject";
import {Float, RawFloat} from "../data";
import {ValueCalc} from "../math";
import {Exclude, Type} from "class-transformer";
import {Level} from "../components";
import { nerdEngine } from "../nerdEngine";

export class Points extends GameObject{

    @Exclude()
    private readonly Level: Level;

    @Exclude()
    private points: Float;

    @Type(() => Float)
    private totalPoints: Float;

    @Exclude()
    private maxPoints: Float;
    @Exclude()
    private maxPointsStep: Float;

    @Exclude()
    public readonly MaxPointsCalc: ValueCalc;

    @Exclude()
    public readonly OnLevelUp?: (_levels: Float) => void;

    @Exclude()
    private readonly basePoints: Float;
    @Exclude()
    private readonly baseMaxPoints: Float;
    @Exclude()
    private readonly baseMaxPointsStep: Float;


    constructor(engine: nerdEngine | null, id: string,
                level: Level, points: RawFloat, maxPoints: RawFloat, maxPointsStep: RawFloat,
                xpMaxCalc: ValueCalc,
                OnLevelUp?: (_levels: Float) => void)
    {
        super(engine, ClassNames.Points, id);
        this.OnLevelUp = OnLevelUp;

        this.Level = level;
        this.points = new Float(points);
        this.maxPoints = new Float(maxPoints);
        this.maxPointsStep = new Float(maxPointsStep);
        this.MaxPointsCalc = xpMaxCalc;
        this.totalPoints = new Float(0);

        this.basePoints = this.points;
        this.baseMaxPoints = this.maxPoints;
        this.baseMaxPointsStep = this.maxPointsStep;
    }

    Reset(resetMaxStep: boolean = true) {
        this.Level.Reset();
        this.totalPoints = new Float(0);
        this.points = this.basePoints;
        this.maxPoints = this.baseMaxPoints;

        if (resetMaxStep) {
            this.maxPointsStep = this.baseMaxPointsStep
        }
    }

    get MaxPoints(): Float {
        return this.maxPoints;
    }

    get MaxPointsStep(): Float {
        return this.maxPointsStep;
    }

    get TotalPointsAdded(): Float {
        return this.totalPoints;
    }

    get LevelValue(): Float {
        return this.Level.Value;
    }

    get LevelMaxValue(): Float | null {
        return this.Level.ValueMax;
    }

    get Points(): Float {
        return this.points;
    }

    AddPoints(value: RawFloat, optimizedMath: boolean = true) {
        value = new Float(value);
        this.points = Float.Plus(this.points, value);
        this.totalPoints = this.totalPoints.Plus(value);

        this.checkForLevelUp(optimizedMath);
    }

    get Progress(): Float {
        return this.Points.Divide(this.MaxPoints).Times(100);
    }

    private checkForLevelUp(optimizedMath: boolean = true): void {
        if (this.Points.IsMoreOrEqual(this.MaxPoints)) {
            if (optimizedMath) {
                this.levelUp();
            }
            else {
                this.levelUpOnce();
            }
        }
    }

    private levelUp() {
        let i = 0;

        let count = -1;
        let prevRight = 1;
        let right = 1;
        let rightFound = false;

        while (!rightFound) {
            i++;
            let sum = this.MaxPointsCalc.GetSum(this.MaxPoints, this.MaxPointsStep, right);

            if (this.points.IsMore(sum)) {
                prevRight = right;
                right = Math.floor(right * 2);
            }
            else {
                rightFound = true;
                count = prevRight;
            }

            if (i > 1000) {
                throw new Error(`Points: Infinite cycle (1)`);
            }
        }

        this.levelUpCount(new Float(count));

        if (count > 100) {
            this.levelUp();
        }
        else {
            this.levelUpOnce();
        }

        if (this.points.IsLess(0)) {
            this.points = new Float(0);
            console.warn('Points become negative');
        }

        this.checkForLevelUp();
    }

    private levelUpCount(count: Float) {
        let sum = this.MaxPointsCalc.GetSum(this.MaxPoints, this.MaxPointsStep, count);

        this.points = this.points.Minus(sum);
        //const maxPointsBefore = this.maxPoints;
        this.maxPoints = this.MaxPointsCalc.GetElement(this.maxPoints, this.maxPointsStep, count.Plus(1));
        //const levelBefore = this.Level.Value;
        this.Level.Value = this.Level.Value.Plus(count);
        //console.log(`~LevelUpCount(${count})\n - Level ${levelBefore} -> ${this.LevelValue}\n - Sum: ${sum}\n - MaxPoints: ${maxPointsBefore} -> ${this.maxPoints}`);

        if (this.OnLevelUp) {
            this.OnLevelUp(new Float(count));
        }
    }

    private levelUpOnce() {
        if (this.points.IsMoreOrEqual(this.MaxPoints)) {
            this.points = this.Points.Minus(this.MaxPoints);

            this.Level.Value = Float.Plus(this.Level.Value, 1);

            this.maxPoints = this.MaxPointsCalc.GetNextElement(this.MaxPoints, this.MaxPointsStep);

            if (this.OnLevelUp) {
                this.OnLevelUp(new Float(1));
            }

            this.checkForLevelUp(false);
        }
    }

    public InitFrom(engine: nerdEngine, item: Points): void {
        this.AddPoints(item.TotalPointsAdded);
    }
}