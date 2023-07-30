import { BlockVolumeUtils, MinecraftBlockTypes, world } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { addMineBlock, addMineBlocks, createMine, deleteMine, getAllMineNames, getMineData, getMineTime, select } from "./manager.js";
import { ID, sleep } from "../../extras/Utils.js";
import { emitter } from "./emitter.js";
import { MS } from "../../extras/Converters.js";
export function mine(plr) {
    const names = getAllMineNames();
    const form = new ActionFormData();
    form.title('§l§bMINES');
    form.button('§l§dCREATE NEW MINE');
    names.forEach(name => { var _a; return form.button(name, (_a = getMineData(name)) === null || _a === void 0 ? void 0 : _a.icon); });
    form.show(plr).then((res) => {
        if (res.canceled)
            return;
        if (res.selection === 0)
            return create(plr);
        see(plr, names[res.selection - 1]);
    });
}
function create(plr) {
    const form = new ModalFormData();
    form.title('§l§dCREATE NEW MINE');
    form.textField('Name:', 'mine1');
    form.textField('Description:', 'Op mine');
    form.textField('Display:', '§cMine1');
    form.textField('Icon:', 'textures/items/diamond_sword');
    form.textField('Reset time(in seconds):\nSet to 0 if this mine can\'t reset automatically', '20', '0');
    form.textField('From(Corner location):', '-100 60 -100');
    form.textField('To(Corner location):', '-120 -60 -120');
    form.textField('Reset Message:', 'Mine1 Has been reset');
    form.show(plr).then((res) => {
        if (res.canceled)
            return;
        let [n, d, di, i, rt, f, t, rm] = res.formValues;
        if (!n)
            return plr.sendMessage('§l§aMINES+ >§r §cYou must specify a mine name!');
        if (isNaN(rt))
            return plr.sendMessage('§l§aMINES+ >§r §cReset time must be a number');
        rt = Number(rt);
        let from = f.split(' '), to = t.split(' ');
        //@ts-ignore
        if (isNaN(from === null || from === void 0 ? void 0 : from[0]) || isNaN(from === null || from === void 0 ? void 0 : from[1]) || isNaN(from === null || from === void 0 ? void 0 : from[2]) || isNaN(to === null || to === void 0 ? void 0 : to[0]) || isNaN(to === null || to === void 0 ? void 0 : to[1]) || isNaN(to === null || to === void 0 ? void 0 : to[2]))
            return plr.sendMessage('§l§aMINES+ >§r §cInvalid location format in from or to arguments');
        createMine({
            name: n,
            id: ID(),
            description: d,
            display: di,
            icon: i,
            timer: undefined,
            every: rt * 1000,
            from: { x: Number(from[0]), y: Number(from[1]), z: Number(from[2]) },
            to: { x: Number(to[0]), y: Number(to[1]), z: Number(to[2]) },
            dimension: plr.dimension.id,
            blocks: [],
            creator: plr.name,
            defaultBlock: MinecraftBlockTypes.stone.id,
            reset: { message: rm, sound: undefined },
            date: Date.now()
        }, plr);
    });
}
function see(plr, name) {
    var _a, _b, _c, _d;
    const data = getMineData(name);
    const id = data.id;
    const form = new ActionFormData();
    form.title(`§r${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : name}`);
    form.body(`§l§dMINE INFORMATION:§r\n§bName: §e${data.name}§r\n§bDisplay Name: §r${(_b = data === null || data === void 0 ? void 0 : data.display) !== null && _b !== void 0 ? _b : '§7None'}§r\n§bDescription: §e${(_c = data === null || data === void 0 ? void 0 : data.description) !== null && _c !== void 0 ? _c : '§7None'}§r\n§bResets every: §e${(data === null || data === void 0 ? void 0 : data.every) ? `${(data === null || data === void 0 ? void 0 : data.every) / 1000} Seconds` : '§cNo automatic reset'}§r\n§bFrom: §e${data === null || data === void 0 ? void 0 : data.from.x} §c${data === null || data === void 0 ? void 0 : data.from.y} §a${data === null || data === void 0 ? void 0 : data.from.z}§r\n§bTo: §e${data === null || data === void 0 ? void 0 : data.to.x} §c${data === null || data === void 0 ? void 0 : data.to.y} §a${data === null || data === void 0 ? void 0 : data.to.z}§r\n§bCreator: §e${data === null || data === void 0 ? void 0 : data.creator}§r\n§bCreation Date: §e${MS(Date.now() - (data === null || data === void 0 ? void 0 : data.date))} ago§r${(data === null || data === void 0 ? void 0 : data.every) ? `\n§bWill reset in: §e${MS(getMineTime(data.name) - Date.now())}§r` : ''}\n§bBlocks: §r\n${((_d = data === null || data === void 0 ? void 0 : data.blocks) === null || _d === void 0 ? void 0 : _d.length) ? data.blocks.map(b => `§dType: §e${b.type} §dChance: §e${b.chance}§r`).join('\n') : '§cNo blocks!'}`);
    form.button('§l§dADD BLOCK');
    form.button('§l§dEDIT MINE');
    form.button('§l§dDELETE MINE');
    form.button('§l§dRESET MINE');
    form.button('§l§dREMOVE BLOCK');
    form.button('§l§dRESET BLOCKS');
    form.show(plr).then((res) => {
        var _a, _b;
        if (res.canceled)
            return mine(plr);
        switch (res.selection) {
            case 0:
                addBlock(plr, name);
                break;
            case 1:
                edit(plr, name);
                break;
            case 2:
                {
                    const form = new MessageFormData();
                    form.title('§l§bDELETE MINE');
                    form.body(`§aAre you sure you want to delete mine §r§7${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : data.name}?`);
                    form.button1('§l§cNo!');
                    form.button2('§l§aYeah!');
                    form.show(plr).then((res) => {
                        if (res.canceled)
                            return;
                        if (!res.selection)
                            return plr.sendMessage('§l§aMINES+ >§r §eOk!');
                        deleteMine(name, plr);
                    });
                }
                break;
            case 3:
                reset(plr, name);
                break;
            case 4:
                removeBlock(plr, name);
                break;
            case 5: {
                const form = new MessageFormData();
                form.title('§l§bRESET BLOCKS');
                form.body(`§aAre you sure you want to reset the blocks of mine §r§7${(_b = data === null || data === void 0 ? void 0 : data.display) !== null && _b !== void 0 ? _b : data.name}?`);
                form.button1('§l§cNo!');
                form.button2('§l§aYeah!');
                form.show(plr).then((res) => {
                    if (res.canceled)
                        return;
                    if (!res.selection)
                        return plr.sendMessage('§l§aMINES+ >§r §eOk!');
                    addMineBlocks(name, [], [], plr);
                });
            }
        }
    });
}
function edit(plr, name) {
    var _a, _b;
    const data = getMineData(name);
    const form = new ModalFormData();
    form.title(`§l§cEDITING §r${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : name}`);
    form.textField('Description:', 'Op mine', data === null || data === void 0 ? void 0 : data.description);
    form.textField('Display:', '§cMine1', data === null || data === void 0 ? void 0 : data.display);
    form.textField('Icon:', 'textures/items/diamond_sword', data === null || data === void 0 ? void 0 : data.icon);
    form.textField('Reset time(in seconds):\nSet to 0 if this mine can\'t reset automatically', '20', (data === null || data === void 0 ? void 0 : data.every) ? String(data.every / 1000) : '0');
    form.textField('From(Corner location):', '-100 60 -100', `${data.from.x} ${data.from.y} ${data.from.z}`);
    form.textField('To(Corner location):', '-120 -60 -120', `${data.to.x} ${data.to.y} ${data.to.z}`);
    form.textField('Reset Message:', 'Mine1 Has been reset', (_b = data === null || data === void 0 ? void 0 : data.reset) === null || _b === void 0 ? void 0 : _b.message);
    form.show(plr).then(async (res) => {
        var _a, _b, _c;
        if (res.canceled)
            return see(plr, name);
        let [d, di, i, rt, f, t, rm] = res.formValues;
        if (isNaN(rt))
            return plr.sendMessage('§l§aMINES+ >§r §cReset time must be a number');
        rt = Number(rt);
        let from = f.split(' '), to = t.split(' ');
        //@ts-ignore
        if (isNaN(from === null || from === void 0 ? void 0 : from[0]) || isNaN(from === null || from === void 0 ? void 0 : from[1]) || isNaN(from === null || from === void 0 ? void 0 : from[2]) || isNaN(to === null || to === void 0 ? void 0 : to[0]) || isNaN(to === null || to === void 0 ? void 0 : to[1]) || isNaN(to === null || to === void 0 ? void 0 : to[2]))
            return plr.sendMessage('§l§aMINES+ >§r §cInvalid location format in from or to arguments');
        plr.sendMessage(`§l§aMINES+ >§r §eEditing mine §r§7${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : data.name}§e this might take a few seconds!`);
        const newData = {
            name: data.name,
            id: ID(),
            description: d,
            display: di,
            icon: i,
            timer: undefined,
            every: rt * 1000,
            from: { x: Number(from[0]), y: Number(from[1]), z: Number(from[2]) },
            to: { x: Number(to[0]), y: Number(to[1]), z: Number(to[2]) },
            dimension: (_b = data.dimension) !== null && _b !== void 0 ? _b : 'overworld',
            blocks: data.blocks,
            creator: plr.name,
            defaultBlock: MinecraftBlockTypes.stone.id,
            reset: { message: rm, sound: undefined },
            date: (_c = data === null || data === void 0 ? void 0 : data.date) !== null && _c !== void 0 ? _c : Date.now()
        };
        emitter.emit('mineEdited', { player: plr, oldData: data, data: newData });
        await sleep(20);
        createMine(newData, plr, true);
    });
}
const blockList = [
    'minecraft:diamond_ore',
    'minecraft:lapis_ore',
    'minecraft:coal_ore',
    'minecraft:redstone_ore',
    'minecraft:emerald_ore',
    'minecraft:iron_ore',
    'minecraft:gold_ore',
    'minecraft:copper_ore',
    'minecraft:deepslate_diamond_ore',
    'minecraft:deepslate_lapis_ore',
    'minecraft:deepslate_coal_ore',
    'minecraft:deepslate_redstone_ore',
    'minecraft:deepslate_emerald_ore',
    'minecraft:deepslate_iron_ore',
    'minecraft:deepslate_gold_ore',
    'minecraft:deepslate_copper_ore',
    'minecraft:quartz_ore',
    'minecraft:nether_gold_ore',
    'minecraft:cobblestone',
    'minecraft:mossy_cobblestone',
    'minecraft:stone',
    'minecraft:granite',
    'minecraft:diorite',
    'minecraft:andesite',
    'minecraft:netherrack',
    'minecraft:end_stone',
];
function addBlock(plr, name) {
    var _a;
    const data = getMineData(name);
    const form = new ActionFormData();
    form.title(`§l§bADD NEW BLOCK - §r${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : name}`);
    form.button('§l§dBLOCK LIST');
    form.button('§l§dTYPE ID');
    form.show(plr).then((res) => {
        if (res.canceled)
            return see(plr, name);
        switch (res.selection) {
            case 0:
                addBlockList(plr, name);
                break;
            case 1:
                addBlockType(plr, name);
                break;
        }
    });
}
function removeBlock(plr, name) {
    var _a;
    const data = getMineData(name);
    const blocks = data.blocks.length ? data.blocks : [];
    const form = new ModalFormData();
    form.title(`§l§bREMOVE BLOCK - §r${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : name}`);
    if (!blocks.length)
        form.dropdown('Blocks:', ['§cNo Blocks']);
    form.dropdown('Blocks:', blocks.map(b => `${b.type} - ${b.chance}`));
    form.show(plr).then((res) => {
        if (res.canceled)
            return see(plr, name);
        if (!blocks.length)
            return see(plr, name);
        const block = blocks[res.formValues[0]];
        let newBlocks = blocks.filter(b => b.type !== block.type && b.chance !== block.chance);
        addMineBlocks(name, newBlocks.map(b => b.type), newBlocks.map(b => b.chance), plr);
    });
}
function addBlockList(plr, name) {
    var _a;
    const data = getMineData(name);
    const form = new ModalFormData();
    form.title(`§l§bADD NEW BLOCK - §r${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : name}`);
    form.dropdown('Block Type:', blockList);
    form.textField('Chance:', '20');
    form.show(plr).then(async (res) => {
        if (res.canceled)
            return addBlock(plr, name);
        let [blockId, chance] = res.formValues;
        blockId = blockList[blockId];
        console.warn(blockId, chance);
        if (!chance || isNaN(chance))
            return plr.sendMessage('§l§aMINES+ >§r §cChance must be a number!');
        chance = Number(chance);
        const type = MinecraftBlockTypes.get(blockId);
        if (!type)
            return plr.sendMessage('§l§aMINES+ >§r §cThat is not a block!');
        addMineBlock(name, type.id, chance, plr);
        await sleep(5);
        addBlockList(plr, name);
    });
}
function addBlockType(plr, name) {
    var _a;
    const data = getMineData(name);
    const form = new ModalFormData();
    form.title(`§l§bADD NEW BLOCK - §r${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : name}`);
    form.textField('Block Type:', 'minecraft:diamond_ore');
    form.textField('Chance:', '20');
    form.show(plr).then(async (res) => {
        if (res.canceled)
            return addBlock(plr, name);
        let [blockId, chance] = res.formValues;
        if (!blockId)
            return plr.sendMessage('§l§aMINES+ >§r §cYou must specify the block type!');
        if (!chance || isNaN(chance))
            return plr.sendMessage('§l§aMINES+ >§r §cChance must be a number!');
        chance = Number(chance);
        const type = MinecraftBlockTypes.get(blockId);
        if (!type)
            return plr.sendMessage('§l§aMINES+ >§r §cThat is not a block!');
        addMineBlock(name, type.id, chance, plr);
        await sleep(5);
        addBlockType(plr, name);
    });
}
function reset(plr, name) {
    var _a;
    const data = getMineData(name);
    const form = new MessageFormData();
    form.title('§l§bRESET MINE');
    form.body(`§aAre you sure you want to reset mine §r§7${(_a = data === null || data === void 0 ? void 0 : data.display) !== null && _a !== void 0 ? _a : data.name}?`);
    form.button1('§l§cNo!');
    form.button2('§l§aYeah!');
    form.show(plr).then((res) => {
        var _a;
        if (res.canceled)
            return see(plr, name);
        if (!res.selection)
            return plr.sendMessage('§l§aMINES+ >§r §eOk!');
        if (data.every !== 0)
            return plr.sendMessage('§l§aMINES+ >§r §cYou can only manually reset if the mine reset time is set to 0');
        emitter.emit('mineReset', { player: plr, data });
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
    });
}
