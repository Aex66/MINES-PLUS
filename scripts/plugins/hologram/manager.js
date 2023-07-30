import { Vector, world } from "@minecraft/server";
export function createHologram(id, text, location) {
    var _a;
    if ((_a = getHologram(id)) === null || _a === void 0 ? void 0 : _a.length)
        return;
    const hologram = location.dimension.spawnEntity('mc:hologram', new Vector(location.x, location.y, location.z));
    hologram.addTag('hologram:' + id);
    hologram.nameTag = text;
    return hologram;
}
export function deleteHologram(id) {
    const hologram = getHologram(id);
    if (!hologram)
        return;
    hologram.forEach(hd => hd.triggerEvent('event:despawn'));
}
export function getHologram(id) {
    return world.getDimension('overworld').getEntities({ tags: ['hologram:' + id], type: 'mc:hologram' });
}
export function getAllHolograms() {
    return world.getDimension('overworld').getEntities({ type: 'mc:hologram' });
}
export function updateHologram(id, text) {
    const hologram = getHologram(id);
    if (!hologram)
        return;
    hologram.forEach(hd => hd.nameTag = text);
}
export function moveHologram(id, location) {
    const hologram = getHologram(id);
    if (!hologram)
        return;
    hologram.forEach(hd => hd.teleport(new Vector(location.x, location.y, location.z), { dimension: location.dimension }));
}
