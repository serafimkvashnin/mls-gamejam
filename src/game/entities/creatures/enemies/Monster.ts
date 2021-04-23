// import {GameScene, Entity} from "../../Entity";
// import {ResourceRegister, TextureId} from "../../../managers/registers/ResourceRegister";
// import Animation = Phaser.Animations.Animation;
// import {Player} from "../player/Player";
// import Vector2 = Phaser.Math.Vector2;
// import Clamp = Phaser.Math.Clamp;
// import Scene = Phaser.Scene;
// import { Game } from "../../../../app";
// import { GameManager } from "../../../managers/GameManager";
//
// //todo pool for monsters, maybe make EntityPool?
//
//
// export class Monster extends Entity {
//
//     static id = 0;
//     public readonly id: number;
//
//     private target: Player | undefined;
//     private viewDistance: number = 50000;
//
//     private animations: {
//         Run: Animation,
//     }
//
//     constructor(scene: GameScene, x: number, y: number) {
//         super(scene, x, y, TextureId.MonsterDead, {
//             health: 5,
//             speed: 5,
//         });
//         this.id = ++Monster.id;
//
//         this.animations = {
//             Run: <Animation>this.anims.create({
//                 key: "Run",
//                 frames: TextureId.MonsterRunAnim,
//                 frameRate: 10,
//                 repeat: -1,
//             })
//         }
//
//         this.EntityEvents.OnDied.Register((sender) => {
//             let corpse = this.scene.add.image(sender.x, sender.y, TextureId.MonsterDead);
//             corpse.setScale(sender.scaleX, sender.scaleY);
//             corpse.setDepth(-10);
//
//             Game.Content.Wallets.Gold.Add(1);
//         })
//
//         this.body.onCollide = true;
//
//         this.setPushable(true);
//         this.setImmovable(false);
//     }
//
//     private updateAI() {
//         if (!this.target) {
//             let target = this.scene.getPlayer();
//             let distance = Phaser.Math.Distance.Between(target.x, target.y, this.x, this.y);
//
//             if (distance < this.viewDistance) {
//                 this.target = target;
//             }
//         }
//     }
//
//     update(time:number, delta:number): void {
//         this.updateAI();
//
//         let input = new Vector2(0, 0);
//
//         if (this.target) {
//             let distance = Phaser.Math.Distance.Between(this.target.x, this.target.y, this.x, this.y);
//             if (distance > this.viewDistance) {
//                 this.target = undefined;
//             }
//
//             // what the MAGIC numbers? @Sima
//             if (this.target && distance > 75) {
//                 input.x = Math.abs(this.target.x - this.x) > 50 ? Clamp(this.target.x - this.x, -1, 1) : 0;
//                 input.y = Math.abs(this.target.y - this.y) > 50 ? Clamp(this.target.y - this.y, -1, 1) : 0;
//
//                 //todo move at angle? pff, too easy! @Felix
//             }
//         }
//
//         input = input.normalize();
//         let velocity = new Vector2(input.x * this.speed.Value.AsNumber * delta, input.y * this.speed.Value.AsNumber * delta);
//         this.setVelocity(velocity.x, velocity.y);
//
//         if (this.target && (input.x != 0 || input.y != 0)) {
//             this.flipX = input.x < 0;
//
//             this.PlayAnimation(this.animations.Run.key)
//             if (this.anims.isPaused) {
//                 this.anims.resume();
//             }
//         }
//         else {
//             this.PlayAnimation(this.animations.Run.key)
//             this.anims.setCurrentFrame(this.anims.currentAnim.getLastFrame());
//             this.anims.pause();
//         }
//     }
// }