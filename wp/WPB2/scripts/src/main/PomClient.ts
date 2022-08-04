import ExGameClient from "../modules/exmc/ExGameClient.js";
import { Player, EntityQueryOptions, MinecraftItemTypes, ItemStack, MinecraftBlockTypes, ItemType } from 'mojang-minecraft';
import MenuUIAlert from "./ui/MenuUIAlert.js";
import menuFunctionUI from "./data/menuFunctionUI.js";
import ExGameServer from '../modules/exmc/ExGameServer.js';
import ExPlayer from "../modules/exmc/entity/ExPlayer.js";
import GlobalSettings from "./cache/GlobalSettings.js";
import { Objective } from "../modules/exmc/entity/ExScoresManager.js";
import ExGameConfig from '../modules/exmc/ExGameConfig.js';
import TagCache from "../modules/exmc/storage/cache/TagCache.js";
import PomData from "./cache/PomData.js";
import TimeLoopTask from "../modules/exmc/utils/TimeLoopTask.js";
import TalentData, { Talent, Occupation } from "./cache/TalentData.js";
import ExColorLoreUtil from "../modules/exmc/item/ExColorLoreUtil.js";
import ExEntity from '../modules/exmc/entity/ExEntity';
import MathUtil from "../modules/exmc/utils/MathUtil.js";
import ExItem from "../modules/exmc/item/ExItem.js";
import Vector3 from "../modules/exmc/utils/Vector3.js";
import ExBlock from "../modules/exmc/block/ExBlock.js";

export default class PomClient extends ExGameClient {
	gameId !: number;
	globalSettings: GlobalSettings;

	cache: TagCache<PomData>;
	strikeSkill = true;
	skillLoop = new TimeLoopTask(this, () => {
		if (this.data.talent.occupation.id === Occupation.ASSASSIN.id) this.strikeSkill = true;
		if (this.data.talent.occupation.id === Occupation.PRIEST.id) {
			let query = new EntityQueryOptions();
			query.maxDistance = 20;
			query.location = this.player.location;
			let health = 999;
			let player: ExPlayer = this.exPlayer;
			for (let p of this.player.dimension.getPlayers(query)) {
				let exp = ExPlayer.getInstance(p);
				if (exp.getHealth() < health) {
					health = exp.getHealth();
					player = exp;
				}
			}
			player.addHealth(this, 20);
		}
	}).delay(10000);
	wbflLooper = new TimeLoopTask(this, () => {
		this.exPlayer.getScoresManager().addScore("wbfl", 2);
	}).delay(5000);
	armorCoolingLooper = new TimeLoopTask(this, () => {
		let scores = this.exPlayer.getScoresManager();
		if (scores.getScore("wbkjlq") > 0) scores.removeScore("wbkjlq", 1);
	}).delay(1000);
	data: PomData;
	looper: TimeLoopTask;
	blockTranslateData: Map<string, ItemStack> = new Map<string, ItemStack>();

	constructor(server: ExGameServer, id: string, player: Player) {
		super(server, id, player);
		this.globalSettings = new GlobalSettings(new Objective("wpsetting"));
		this.cache = new TagCache(this.exPlayer);
		this.looper = new TimeLoopTask(this, () => {
			this.cache.save();
		});
		this.looper.delay(10000);
		this.looper.start();
		this.wbflLooper.start();
		this.data = this.cache.get(new PomData());

		if (this.data.talent.occupation.id === Occupation.PRIEST.id) this.skillLoop.start();
		this.register();
	}
	register() {
		this.getEvents().exEvents.itemUse.subscribe((e) => {
			const {
				item
			} = e;

			if (item.id == "wb:power") {
				new MenuUIAlert(this, menuFunctionUI).showPage(["main", "notice"]);
			}
		});



		//职业
		this.getEvents().exEvents.playerHitEntity.subscribe((e) => {
			let item = this.exPlayer.getBag().getItemOnHand();
			let damageFac = 0;
			let extraDamage = 0;
			let target = ExEntity.getInstance(e.hurtEntity);
			let dis = target.getPosition().distance(this.exPlayer.getPosition());
			if (!item) {
				let CLOAD_PIERCING = this.talentRes.get(Talent.CLOAD_PIERCING) ?? 0;

				damageFac += Math.min(64, dis) / 64 * CLOAD_PIERCING / 100;
				let ARMOR_BREAKING = this.talentRes.get(Talent.ARMOR_BREAKING) ?? 0;
				extraDamage += this.exPlayer.getMaxHealth() * ARMOR_BREAKING / 100;

				let SANCTION = this.talentRes.get(Talent.SANCTION) ?? 0;
				damageFac += (16 - Math.min(16, dis)) / 16 * SANCTION / 100;
				let SUDDEN_STRIKE = this.talentRes.get(Talent.SUDDEN_STRIKE) ?? 0;
				if (this.strikeSkill) {
					if (this.data.talent.occupation.id === Occupation.ASSASSIN.id) this.skillLoop.startOnce();
					this.strikeSkill = false;
					damageFac += SUDDEN_STRIKE / 100;
				}

			} else {
				let lore = new ExColorLoreUtil(item);

				let CLOAD_PIERCING = MathUtil.zeroIfNaN(parseFloat((lore.getValueUseMap("addition", Talent.getCharacter(Talent.CLOAD_PIERCING)) ?? "->0").split("->")[1]));

				damageFac += Math.min(64, dis) / 64 * CLOAD_PIERCING / 100;
				let ARMOR_BREAKING = MathUtil.zeroIfNaN(parseFloat((lore.getValueUseMap("addition", Talent.getCharacter(Talent.ARMOR_BREAKING)) ?? "->0").split("->")[1]));
				extraDamage += this.exPlayer.getMaxHealth() * ARMOR_BREAKING / 100;
				let SANCTION = MathUtil.zeroIfNaN(parseFloat((lore.getValueUseMap("addition", Talent.getCharacter(Talent.SANCTION)) ?? "->0").split("->")[1]));
				damageFac += (16 - Math.min(16, dis)) / 16 * SANCTION / 100;


				let SUDDEN_STRIKE = MathUtil.zeroIfNaN(parseFloat((lore.getValueUseMap("addition", Talent.getCharacter(Talent.SUDDEN_STRIKE)) ?? "->0").split("->")[1]));
				if (item.id.startsWith("dec:")) damageFac += 0.4;
				if (this.strikeSkill) {
					if (this.data.talent.occupation.id === Occupation.ASSASSIN.id) this.skillLoop.startOnce();
					this.strikeSkill = false;
					damageFac += SUDDEN_STRIKE / 100;
				}
			}

			let damage = e.damage * damageFac + extraDamage;
			target.removeHealth(this, damage);
		});

		this.getEvents().exEvents.playerHurt.subscribe((e) => {
			let damage = (this.exPlayer.getPreRemoveHealth() ?? 0) + e.damage;
			let add = 0;
			add += damage * (this.talentRes.get(Talent.DEFENSE) ?? 0) / 100;

			this.exPlayer.addHealth(this, add);
		});
		this.getEvents().exEvents.itemOnHandChange.subscribe((e) => {
			if (e.afterItem?.id.startsWith("wb:sword_") || e.afterItem?.id.startsWith("wb:staff_")) {
				TalentData.calculateTalentToLore(this.data.talent, e.afterItem);
				this.exPlayer.getBag().setItem(this.exPlayer.selectedSlot, e.afterItem);
			}
			this.exPlayer.triggerEvent("hp:" + Math.round((20 + (this.talentRes.get(Talent.VIENTIANE) ?? 0))));
		});


		//附魔
		this.getEvents().exEvents.onceItemUseOn.subscribe((e) => {
			let pos=new Vector3(e.blockLocation);
			let block = this.getDimension().getBlock(pos);
			if (!block || block.id === MinecraftBlockTypes.air.id) return;
			//ExGameConfig.console.log(block.id,e.item.id);
			if (block.id === "wb:block_translate") {
				let bag = this.exPlayer.getBag();
				let item = bag.getItemOnHand();
				if (item) {
					if (item.id === "wb:book_cache") {
						this.blockTranslateData.set(new Vector3(block).toString(), item);
						ExBlock.getInstance(block).transTo("wb:block_translate_book");
						//item.amount--;
						bag.setItem(this.exPlayer.selectedSlot, item);
					}
				}
			} else if (block.id === "wb:block_translate_book") {
				let bag = this.exPlayer.getBag();
				let item = bag.getItemOnHand();
				let saveItem = this.blockTranslateData.get(new Vector3(block).toString());
				if (!saveItem) return ExBlock.getInstance(block).transTo("wb:block_translate");
				if (item) {
					let exItem = ExItem.getInstance(item);
					let befexItem = ExItem.getInstance(saveItem);
					let newItem = new ExItem(new ItemStack());
					let lore = new ExColorLoreUtil(newItem);
					if (exItem.hasEnchantsComponent()) {

						for (let i of exItem.getEnchantsComponent().enchantments) {
							newItem.getEnchantsComponent().enchantments.addEnchantment(i);
						}

						exItem.getEnchantsComponent().removeAllEnchantments();
					}
					newItem.setLore(exItem.getLore());
					lore = new ExColorLoreUtil(item);
					if (befexItem.hasEnchantsComponent() && exItem.hasEnchantsComponent()) {

						for (let i of befexItem.getEnchantsComponent().enchantments) {
							exItem.getEnchantsComponent().enchantments.addEnchantment(i);
						}

						befexItem.getEnchantsComponent().removeAllEnchantments();
					}
					lore.setLore(befexItem.getLore());
					this.blockTranslateData.delete(new Vector3(block).toString());
					ExBlock.getInstance(block).transTo("wb:block_translate");
					bag.setItem(this.exPlayer.selectedSlot, item);
					this.getDimension().spawnItem(newItem.getItem(),pos.add(new Vector3(0,1,0)));
				}
			}
		});

	}
	talentRes: Map<number, number> = new Map<number, number>();
	updateTalentRes() {
		for (let t of this.data.talent.talents) {
			this.talentRes.set(t.id, TalentData.calculateTalent(this.data.talent, t.id, t.level));
		}
		let scores = this.exPlayer.getScoresManager();
		scores.setScore("wbwqlqjs", Math.round(100 + (this.talentRes.get(Talent.DEFENSE) ?? 0)));
		this.wbflLooper.delay(1 / (1 / 5000 * (1 + (this.talentRes.get(Talent.DEFENSE) ?? 0) / 100) * (1 + scores.getScore("wbgjcg") * 3 / 100)));
		this.armorCoolingLooper.delay(1 / (1 / 1000 * (1 + (this.talentRes.get(Talent.RELOAD) ?? 0) / 100)));

		this.exPlayer.triggerEvent("hp:" + Math.round((20 + (this.talentRes.get(Talent.VIENTIANE) ?? 0))));
	}



	override onLoaded(): void {
		this.gameId = ExPlayer.getInstance(this.player).getScoresManager().getScore("wbldid");
		this.updateTalentRes();
		if (this.player.hasTag("wbmsyh")) {
			this.player.nameTag = "§a" + this.player.nameTag;
		} else {
			this.player.nameTag = "§c" + this.player.nameTag;
		}


		(function (c: PomClient) {
			c.sayTo("本addon由aa剑侠和Lileyi制作，若发现其他地方信息被修改过请及时通知我们！")
		})(this);


	}

	override onLeave(): void {
		this.looper.stop();
		super.onLeave();
	}

	getPlayersAndIds() {
		return this.runOnServer<[Player, number][]>((server) => {
			let arr: [Player, number][] = [];
			for (let i of server.getClients()) {
				arr.push([i.player, (<PomClient>i).gameId]);
			}
			return arr;
		});
	}

	sayTo(str: string, p = this.player) {
		p.runCommand(`tellraw @s {"rawtext": [{"text": "${str}"}]}`);
	}
}

