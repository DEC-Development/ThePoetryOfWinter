import { ActionFormData } from "@minecraft/server-ui";
import ExPlayer from "../../../modules/exmc/server/entity/ExPlayer.js";
export class Task {
    constructor(id, xp_change, commands) {
        this.id = id;
        this.commands = commands;
        this.commands.push("tellraw @s[tag=task_complete] { \"rawtext\" : [ { \"translate\" : \"text.dec:task_" + id + "_complete.name\" } ] }", "tellraw @s[tag=!task_complete] { \"rawtext\" : [ { \"translate\" : \"text.dec:task_fail.name\" } ] }", "loot give @s[tag=task_complete] loot \"tasks/" + id + "\"", "xp @s[tag=task_complete] " + xp_change.toString(), "replaceitem entity @s[tag=task_complete] slot.weapon.mainhand 0 air", "tag @s remove task_complete");
    }
    title() {
        let title = "text.dec:task_" + this.id + "_title.name";
        return title;
    }
    body() {
        let body = "text.dec:task_" + this.id + "_body.name";
        return body;
    }
}
//tag给符合条件加task_complete
export let Tasks = [
    new Task("000", 200, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:lava_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:lava_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:lava_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:lava_boots}] run tag @s add task_complete",
    ]),
    new Task("001", 140, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:frozen_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:frozen_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:frozen_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:frozen_boots}] run tag @s add task_complete",
    ]),
    new Task("002", 170, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:rupert_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:rupert_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:rupert_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:rupert_boots}] run tag @s add task_complete",
    ]),
    new Task("003", 60, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:amethyst_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:amethyst_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:amethyst_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:amethyst_boots}] run tag @s add task_complete",
    ]),
    new Task("004", 50, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:copper_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:copper_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:copper_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:copper_boots}] run tag @s add task_complete",
    ]),
    new Task("005", 300, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:crying_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:crying_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:crying_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:crying_boots}] run tag @s add task_complete",
    ]),
    new Task("006", 80, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:emerald_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:emerald_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:emerald_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:emerald_boots}] run tag @s add task_complete",
    ]),
    new Task("007", 700, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:everlasting_winter_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=dec:everlasting_winter_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=dec:everlasting_winter_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=dec:everlasting_winter_boots}] run tag @s add task_complete",
    ]),
    new Task("008", 200, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:knight_helmet}] if entity @s[hasitem={location=slot.armor.chest,item=iron_chestplate}] if entity @s[hasitem={location=slot.armor.legs,item=iron_leggings}] if entity @s[hasitem={location=slot.armor.feet,item=iron_boots}] run tag @s add task_complete",
    ]),
    new Task("009", 100, [
        "execute if entity @s[hasitem={location=slot.armor.head,item=dec:witch_hat}] run tag @s add task_complete",
    ])
];
export function taskTranToNum(t) {
    let task_arr = ["Ao", "Jf", "Sk", "Ch", "Om", "Bs", "Hd", "Oa", "Gx", "Xe"];
    let n = "";
    while (t.length >= 2) {
        let msg = t.slice(0, 2);
        n = n + (task_arr.findIndex(e => e === msg));
        t = t.slice(3);
    }
    return n;
}
export function numTranToTask(n) {
    let r = "";
    let task_arr = ["Ao", "Jf", "Sk", "Ch", "Om", "Bs", "Hd", "Oa", "Gx", "Xe"];
    for (let l = 0; l <= n.toString().length - 1; l++) {
        r = r + task_arr.slice(parseInt(n.toString().charAt(l)), parseInt(n.toString().charAt(l)) + 1) + " ";
    }
    while (r.charAt(-1) == " ") {
        r = r.slice(0, r.length - 1);
    }
    return r;
}
export function taskUi(p, i) {
    let ui = new ActionFormData();
    ui = ui.title("text.dec:task_choose_title.name");
    ui = ui.body("text.dec:task_choose_body.name");
    let lor = i.getLore();
    lor.forEach(l => {
        ui = ui.button(l);
    });
    ui.show(p).then(s => {
        if (s.selection != undefined) {
            let ch_t = lor[s.selection];
            let ch_n = taskTranToNum(ch_t);
            //p.runCommandAsync("say "+ch_n)
            taskUiChoose(p, ch_n);
        }
    });
}
export function taskUiChoose(p, id) {
    let ui_ch = new ActionFormData().button("text.dec:task_complete_button.name");
    const index = Tasks.findIndex(t => t.id === id);
    if (index === -1) {
        return;
    }
    ui_ch.title(Tasks[index].title())
        .body(Tasks[index].body())
        .show(p).then(s => {
        if (s.selection == 0) {
            ExPlayer.getInstance(p).command.run(Tasks[index].commands);
        }
    });
}
//# sourceMappingURL=Task.js.map