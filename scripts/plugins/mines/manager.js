import { BlockVolumeUtils, MinecraftBlockTypes, system, world } from "@minecraft/server";
import Database from "../../lib/Database.js";
import { sleep } from "../../extras/Utils.js";
import { emitter } from "./emitter.js";
//import { createHologram } from "../hologram/manager.js";
let mines = null;
let mineTimers = null;
(async function () {
    mines = await Database.register('mines', 'data');
    mineTimers = await Database.registry('mineTimers');
})();
export async function createMine(data, creator, edit = false) {
    if (!edit && mines.has(data.name))
        return creator.sendMessage(`§l§aMINES+ >§r §cThis server already has a mine called §a${data.name}`);
    creator.sendMessage(`§l§aMINES+ >§r §aSuccesfully ${!edit ? 'created' : 'edited'} mine §e${data.name}§a, remember to do §c"/tickingarea add circle ~ ~ ~ 4"§a for automatic mines!`);
    emitter.emit('mineCreated', { data, player: creator });
    /**
    if (!edit) {
        const center = BoundingBoxUtils.getCenter({ min: data.from, max: data.to }),
        max = BlockVolumeUtils.getMax({ from: data.from, to: data.to })
        createHologram(data.id, `${data?.display ?? `§l§e${data.name}`}`, { x: center.x, y: max.y + 3, z: center.z, dimension: world.getDimension(data.dimension) })
    }
    */
    mines.write(data.name, data);
}
export async function deleteMine(name, player, isReset = false) {
    if (!mines.has(name))
        return !isReset ? player.sendMessage(`§l§aMINES+ >§r §cThis server does not have a mine called §a${name}`) : void 0;
    if (!isReset)
        player.sendMessage(`§l§aMINES+ >§r §aSuccesfully deleted mine §e${name}§a`);
    emitter.emit('mineDeleted', { data: getMineData(name), player, isReset });
    if (!isReset)
        mineTimers.deleteMany(mineTimers.findMany(Number(getMineData(name).id)));
    mines.delete(name);
    await sleep(5);
}
export function getMineTime(name) {
    const data = getMineData(name);
    if (!data)
        return;
    if (!data.every)
        return undefined;
    if (!mineTimers.find(Number(data.id)))
        return;
    return Number(mineTimers.find(Number(data.id)).split('$-$')[0]);
}
export async function addMineBlock(name, type, chance, player) {
    if (!mines.has(name))
        return player.sendMessage(`§l§aMINES+ >§r §cThis server does not have a mine called §a${name}`);
    const data = getMineData(name);
    emitter.emit('mineBlocksChange', { player, data, block: type, chance });
    data.blocks.push({ type, chance });
    deleteMine(name, player, true);
    mines.write(name, data);
    await sleep(5);
}
export async function addMineBlocks(name, types, chances, player) {
    if (!mines.has(name))
        return player.sendMessage(`§l§aMINES+ >§r §cThis server does not have a mine called §a${name}`);
    const data = getMineData(name);
    emitter.emit('mineBlocksChange', { player, data, block: types, chance: chances });
    const newBlocks = [];
    types.forEach((type, index) => newBlocks.push({ type, chance: chances[index] }));
    data.blocks = newBlocks;
    deleteMine(name, player, true);
    mines.write(name, data);
    await sleep(5);
}
export function getAllMineNames() {
    return mines.allKeys();
}
export function getMineData(name) {
    var _a, _b;
    const data = mines === null || mines === void 0 ? void 0 : mines.read(name);
    const timer = (_b = (_a = mineTimers === null || mineTimers === void 0 ? void 0 : mineTimers.find(Number(data.id))) === null || _a === void 0 ? void 0 : _a.split('$-$')) === null || _b === void 0 ? void 0 : _b[0];
    return {
        name: data.name,
        id: data.id,
        description: data.description,
        display: data.display,
        icon: data.icon,
        timer: isNaN(Number(timer)) ? 0 : Number(timer),
        every: data.every,
        from: data.from,
        dimension: data.dimension,
        to: data.to,
        blocks: data.blocks,
        creator: data.creator,
        defaultBlock: data.defaultBlock,
        reset: data.reset,
        date: data.date
    };
}
system.runInterval(() => {
    const names = getAllMineNames();
    if (!(names === null || names === void 0 ? void 0 : names.length))
        return;
    names.forEach(async (name) => {
        var _a;
        const data = getMineData(name);
        if (!data)
            return;
        if (!data.every && data.every == 0)
            return;
        if (data.timer > Date.now())
            return;
        emitter.emit('mineReset', { player: undefined, data });
        let invalid = false;
        if ((_a = data === null || data === void 0 ? void 0 : data.blocks) === null || _a === void 0 ? void 0 : _a.length) {
            [...BlockVolumeUtils.getBlockLocationIterator({ from: data.from, to: data.to })].forEach((loc) => {
                if (invalid)
                    return;
                const type = MinecraftBlockTypes.get(select(data));
                if (!type)
                    invalid = true;
                world.getDimension(data.dimension).getBlock(loc).setType(type);
            });
        }
        mineTimers.deleteMany(mineTimers.findMany(Number(data.id)));
        await sleep(5);
        mineTimers.write(`${Date.now() + data.every}$-$${data.name}$-$${data.id}`, Number(data.id));
    });
}, 20);
/**
 * FUTURE UPDATE - HOLOGRAMSS
system.runInterval(() => {
    const names = getAllMineNames()
    if (!names?.length) return;
    names.forEach(name => {
        const data = getMineData(name)
        if (!data) return;
        if (!data.every && data.every == 0) return updateHologram(data.id, `${data?.display ?? `§l§e${data.name}`}`)
        updateHologram(data.id, `${data?.display ?? `§l§e${data.name}`}§r\n§7Resets in: §f${MS(Number(mineTimers.find(Number(data.id)).split('$-$')[0]) - Date.now())}`)
    })
}, 20)
*/
export function select(mine) {
    const totalChances = mine.blocks.reduce((acc, block) => acc + block.chance, 0);
    const randomValue = Math.random() * totalChances;
    let cumulativeChance = 0;
    for (const block of mine.blocks) {
        cumulativeChance += block.chance;
        if (randomValue <= cumulativeChance) {
            return block.type;
        }
    }
    return mine.defaultBlock;
}
