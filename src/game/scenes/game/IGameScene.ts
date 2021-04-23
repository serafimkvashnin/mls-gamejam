import { CreatureGroup } from "../../entities/creatures/CreatureGroup";
import { EnemyGroup } from "../../entities/creatures/enemies/EnemyGroup";
import { Player } from "../../entities/creatures/player/Player";
import { EntityGroup } from "../../entities/EntityGroup";
import { Pan } from "../../entities/level/Pan";
import { ProjectileGroup } from "../../entities/projectiles/group/ProjectileGroup";

export interface IGameScene {
    worldWidth: number;
    worldHeight: number;

    pan: Pan;
    player: Player;
    entityGroup: EntityGroup;
    creatureGroup: CreatureGroup;
    enemyGroup: EnemyGroup;
    projectileGroup: ProjectileGroup;
}