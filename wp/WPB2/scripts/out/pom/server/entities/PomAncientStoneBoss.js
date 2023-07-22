import { EntityDamageCause } from '@minecraft/server';
import PomBossController from './PomBossController.js';
export default class PomAncientStoneBoss extends PomBossController {
    constructor(e, server) {
        super(e, server);
        this.music = server.getSound("music.wb.anger_of_ancient", "2:24");
    }
    initBossEntity() {
        for (let c of this.barrier.clientsByPlayer()) {
            c.ruinsSystem.causeDamageShow = true;
            c.ruinsSystem.causeDamageType.add(this.entity.typeId);
        }
        if (!this.exEntity.hasIsBabyComponent() && this.isFisrtCall) {
            this.server.say({ rawtext: [{ translate: "text.wb:summon_ancient_stone.name" }] });
            this.setTimeout(() => {
                this.music.loop(this.exEntity.exDimension, this.entity.location);
            }, 500);
            // this.getEvents().exEvents.tick.subscribe(e => {
            //     this.entity.runCommand(`execute as @a[r=128] run camera @s set minecraft:third_person pos ^ ^+10 ^-15 facing @s`);
            // });
        }
    }
    onSpawn() {
        super.onSpawn();
    }
    onKilled(e) {
        //设置奖励
        if (this.exEntity.hasIsBabyComponent()) {
            for (let c of this.barrier.clientsByPlayer()) {
                c.progressTaskFinish(this.entity.typeId, c.ruinsSystem.causeDamage);
                c.ruinsSystem.causeDamageShow = false;
            }
            this.server.say({ rawtext: [{ translate: "text.wb:defeat_ancient_stone.name" }] });
            // this.exEntity.runCommandAsync(`camera @a[r=128] clear`);
            console.warn("onWin");
            this.stopBarrier();
            this.music.stop();
        }
        if (e.damageSource.cause === EntityDamageCause.suicide) {
            this.music.stop();
        }
        super.onKilled(e);
    }
    onFail() {
        this.music.stop();
        let pos = this.entity.location;
        // this.exEntity.runCommandAsync(`camera @a[r=128] clear`);
        super.onFail();
    }
}
PomAncientStoneBoss.typeId = "wb:ancient_stone";
//# sourceMappingURL=PomAncientStoneBoss.js.map