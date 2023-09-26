import './form.js';
import './command.js';
import { emitter } from './emitter.js';
import { BlockVolumeUtils, BoundingBoxUtils, Vector, world } from '@minecraft/server';
emitter.on('mineReset', (res) => {
    var _a, _b, _c, _d, _e, _f;
    /**
     * THIS EVENT FIRES WHEN A MINE IS RESET
     * Arguments:
     * data: Data of the mine that has been reset
     * player: Player who reset the mine (optional)
     */
    if (res === null || res === void 0 ? void 0 : res.player)
        res.player.sendMessage(`§l§aMINES+ > §r§eYou have reset the mine §r§7${((_a = res.data) === null || _a === void 0 ? void 0 : _a.display) ? (_b = res.data) === null || _b === void 0 ? void 0 : _b.display : res.data.name}§r`);
    if ((_d = (_c = res.data) === null || _c === void 0 ? void 0 : _c.reset) === null || _d === void 0 ? void 0 : _d.message)
        world.sendMessage(res.data.reset.message);
    else
        world.sendMessage(`§l§aMINES+ > §r§eMine §r§7${((_e = res.data) === null || _e === void 0 ? void 0 : _e.display) ? (_f = res.data) === null || _f === void 0 ? void 0 : _f.display : res.data.name}§r §ehas been reset!§r`);
    const box = BoundingBoxUtils.createValid(res.data.from, res.data.to);
    const max = BlockVolumeUtils.getMax({ from: res.data.from, to: res.data.to });
    world.getAllPlayers().filter(p => BoundingBoxUtils.isInside(box, p.location)).forEach(p => p.teleport(new Vector(p.location.x, max.y + 1, p.location.z)));
});
emitter.on('mineBlocksChange', (res) => {
    /**
     * THIS EVENT FIRES WHEN MINE BLOCKS ARE CHANGED
     * Arguments:
     * data: Data of the mine
     * player: Player who added the block
     * block: Block or blocks that are added
     * chance: Chance or chances of the blocks
     */
    res.player.sendMessage('§l§aMINES+ > §r §eSuccess§r');
});
emitter.on('mineCreated', (res) => {
    /**
     * THIS EVENT FIRES WHEN A MINE IS CREATED
     * Arguments:
     * data: Data of the mine that has been created
     * player: Player who created the mine
     */
});
emitter.on('mineDeleted', (res) => {
    /**
     * THIS EVENT FIRES WHEN A MINE IS DELETED
     * Arguments:
     * data: Data of the mine that has been deleted
     * player: Player who deleted the mine
     * isReset: Boolean representing if the delete was for a reset; example: add new blocks.
     */
});
emitter.on('mineEdited', (res) => {
    /**
     * THIS EVENT FIRES WHEN A MINE IS EDITED
     * Arguments:
     * data: New data of the mine that has been edited
     * player: Player who edited the mine
     * oldData: Old data of the mine that has been edited
     */
});
/**
 * FUTURE UPDATES:
 * Add more blocks to the BlockAddList
 * Change mine properties that change so often to registry for better performance
 * Add a way to detect the amount of remaining blocks in the mine
 * Add a new reset method: percentage - Reset when mine is at certaing amount of blocks (percentage)
 * Add holograms for mines that shows remaining blocks, remaining time for reset <mineName>\n<RemainingBlocks>/<maxBlocks>\nMine will reset in: <remainingTime>
 * Add a mine propertie called "effects" that adds effects to the players that are inside the mine.
 */ 
