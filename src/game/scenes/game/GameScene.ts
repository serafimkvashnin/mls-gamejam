import { Scene } from "phaser";
import { Game } from "../../../app";
import { HealthComponent } from "../../entities/components/HealthComponent";
import { Creature } from "../../entities/creatures/Creature";
import { CreatureGroup } from "../../entities/creatures/CreatureGroup";
import { Enemy } from "../../entities/creatures/enemies/Enemy";
import { EnemyGroup } from "../../entities/creatures/enemies/EnemyGroup";
import { Player } from "../../entities/creatures/player/Player";
import { EntityGroup } from "../../entities/EntityGroup";
import { Pan } from "../../entities/level/Pan";
import { ProjectileGroup } from "../../entities/projectiles/group/ProjectileGroup";
import { Projectile } from "../../entities/projectiles/Projectile";
import { SoundId, TextureId } from "../../managers/registers/ResourceRegister";
import { AngleToVector2 } from "../../utils/MathHelper";
import { IGameScene } from "./IGameScene";
import Vector2 = Phaser.Math.Vector2;
import Color = Phaser.Display.Color;

export abstract class GameScene extends Scene implements IGameScene {
    public worldWidth!: number;
    public worldHeight!: number;

    private _pan!: Pan;
    private _player!: Player;
    private _entityGroup!: EntityGroup;
    private _creatureGroup!: CreatureGroup;
    private _enemyGroup!: EnemyGroup;
    private _projectileGroup!: ProjectileGroup;

    public create(): void {
        this.cameras.main.setZoom(6);
        this.worldWidth = this.cameras.main.displayWidth;
        this.worldHeight = this.cameras.main.displayHeight;

        this._creatureGroup = new CreatureGroup(this);
        this._enemyGroup = new EnemyGroup(this, this._creatureGroup);
        this._projectileGroup = new ProjectileGroup(this);

        this._pan = new Pan(this, 0, 0);
        //var graphics = this.add.graphics();
        //graphics.strokeCircleShape(this.pan.circle);

        this._player = new Player(this, this._pan.height / 2, this._pan.height / 2);
        this.creatureGroup.add(this.player);

        this.cameras.main.startFollow(this.player);

        this.registerCollisions();

        this.physics.world.enable(this.creatureGroup);
    }

    public update(time: number, delta: number): void {
        this.pan.handleCollisions(this.creatureGroup);
        this.creatureGroup.sortY();
    }

    protected registerCollisions(): void {
        this.physics.add.overlap(this.player, this.enemyGroup, (obj1, obj2) => {
            this.player.getComponent(HealthComponent)?.modifyHealth(-1, obj2 as Enemy);

            this.player.setTint(new Color(255, 0, 0, 50).color32);
            this.time.delayedCall(150, () => {
                this.player.clearTint();
            })

            this.sound.play(SoundId.Hit, {
                volume: 0.5,
            })
            this.cameras.main.shake(100, 0.0002);
            //console.log(`Player health: ${this.player.getComponent(HealthComponent)?.health} / ${this.player.getComponent(HealthComponent)?.maxHealth}`);
        })

        this.physics.add.overlap(this.projectileGroup, this.enemyGroup, (obj1, obj2) => {
            const projectile = obj1 as Projectile;
            const enemy = obj2 as Enemy;

            enemy.setTintFill(new Color(255, 255, 255, 255).color32);
            this.time.delayedCall(100, () => {
                enemy.clearTint();
            })

            enemy.addImpulse(projectile, projectile.config.knockback);
            enemy.getComponent(HealthComponent)?.modifyHealth(-projectile.config.damage.Value.AsNumber, projectile);
            projectile.onDeath.Trigger(projectile, { from: enemy });

            this.projectileGroup.killAndHide(projectile);
        });        

        this.physics.add.overlap(this.enemyGroup, this.enemyGroup, (obj1, obj2) => {
            const force = 5;
            const enemy1 = obj1 as Creature;
            const enemy2 = obj2 as Creature;
            enemy1.addImpulse(enemy2, force);
            enemy2.addImpulse(enemy1, force);
        });

        this.physics.add.overlap(this.player, this.enemyGroup, (obj1, obj2) => {
            const force = 500;
            const player = obj1 as Creature;
            const enemy = obj2 as Creature;
            player.addImpulse(enemy, force);
            enemy.addImpulse(player, force);
        });
    }

    // TODO: fix (i guess it's fine, isn't it? @Felix)
    spawnEnemyAtRandomPosition(): void {
        const position = this.pan.getRandomPositionInside();
        const enemy = new Enemy(this, position.x, position.y);
        this.enemyGroup.add(enemy);
    }

    public get pan(): Pan {
        return this._pan;
    }

    public get player(): Player {
        return this._player;
    }

    public get entityGroup(): EntityGroup {
        return this._entityGroup;
    }

    public get projectileGroup(): ProjectileGroup {
        return this._projectileGroup;
    }

    public get creatureGroup(): CreatureGroup {
        return this._creatureGroup;
    }

    public get enemyGroup(): EnemyGroup {
        return this._enemyGroup;
    }
}