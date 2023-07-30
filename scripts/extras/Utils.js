import { ItemTypes, Enchantment, ItemStack, world, system } from "@minecraft/server";
import { MinecraftEnchantmentTypes } from "../mojang-data/mojang-enchantment";
import { settingsReg } from "../main";
import { prefix } from "../config";
export const getItemData = (item) => {
    if (!item)
        return undefined;
    const itemData = {
        id: item.typeId,
        amount: item.amount,
        nameTag: item.nameTag,
        lore: item.getLore(),
        enchantments: [],
    };
    if (!item.hasComponent("enchantments"))
        return itemData;
    //@ts-ignore
    const enchants = item.getComponent('enchantments').enchantments;
    if (enchants) {
        for (let k in MinecraftEnchantmentTypes) {
            const type = MinecraftEnchantmentTypes[k];
            if (!enchants.hasEnchantment(type))
                continue;
            const enchant = enchants.getEnchantment(type);
            itemData.enchantments.push({
                id: enchant.type.id,
                level: enchant.level,
            });
        }
    }
    return itemData;
};
/**
   * This function allows you to create a new itemStack instance with the data saved with the getItemData function.
   * @param {ItemData} itemData - The data saved to create a new item
   * @returns {itemStack}
*/
export const newItem = (itemData) => {
    const item = new ItemStack(ItemTypes.get(itemData.id), itemData.amount);
    item.nameTag = itemData.nameTag;
    item.setLore(itemData.lore);
    const enchComp = item.getComponent("enchantments");
    //@ts-ignore
    const enchants = enchComp === null || enchComp === void 0 ? void 0 : enchComp.enchantments;
    if (enchants) {
        for (let enchant of itemData.enchantments) {
            const type = enchant.id
                .replace("minecraft:", "")
                .replace(/_(.)/g, (match) => match[1].toUpperCase());
            if (!type)
                continue;
            enchants.addEnchantment(new Enchantment(type, enchant.level));
        }
        //@ts-ignore
        enchComp.enchantments = enchants;
    }
    return item;
};
/**
 * Import not-existent objectives
 * @param {Array<{ id: string, displayName?: string}>} objectives
 */
export const importObjectives = async (objectives) => {
    const f = objectives.filter(o => !world.scoreboard.getObjective(o.id));
    if (!f.length)
        return;
    f.forEach(o => { var _a; return world.scoreboard.addObjective(o.id, (_a = o.displayName) !== null && _a !== void 0 ? _a : o.id); });
    console.warn("OBJECTIVES IMPORTED!");
};
/**
 * KITS API EXCLUSIVE
 */
export const removeAllCooldownTags = (player, kit) => {
    if (kit)
        return player.getTags().filter(tag => tag.startsWith(`KA-Cooldown:${kit}:`)).forEach(tag => player.removeTag(tag));
    player.getTags().filter(tag => tag.startsWith(`KA-Cooldown:`)).forEach(tag => player.removeTag(tag));
};
/**
 * Stop the code for a certain amount of time
 * @param {number} ticks How long do you want the code to stop in ```ticks```
 */
export async function sleep(ticks, callback) {
    return new Promise(resolve => {
        const id = system.runInterval(() => {
            resolve();
            system.clearRun(id);
            if (callback)
                callback();
        }, ticks);
    });
}
/**
 * GET RANDOM DIGIT ID
 */
export const ID = () => `${new Date().getTime()}`.split('').reverse().slice(0, 9).join('').replace(/0/, `${~~(Math.random() * 9)}`);
export const getPrefix = () => settingsReg.find(0) ? settingsReg.find(0) : prefix;
