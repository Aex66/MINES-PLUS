/*
Developers:
Aex66:
Discord: Aex66#0202
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
           _____
          /  _  \   ____ ___  ___
         /  /_\  \_/ __ \\  \/  /
        /    |    \  ___/ >    <
        \____|__  /\___  >__/\_ \
                \/     \/      \/
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
© Copyright 2023 all rights reserved. Do NOT steal, copy the code, or claim it as yours.
Thank you
*/
import { EquipmentSlot, world } from "@minecraft/server";
import { EconomyObjective, adminTag } from "../../../config.js";
import { MS } from "../../../extras/Converters.js";
import { translate } from "../../../extras/Lang.js";
import { newItem, removeAllCooldownTags } from "../../../extras/Utils.js";
import { FormKit } from "./FormKit.js";
import { ReclaimSelect } from "./ReclaimSelect.js";
import { ActionFormData } from "@minecraft/server-ui";
import { kits } from "../../../lib/Script.js";
import { emitter } from "../../../main.js";
export const Reclaim = (player, kitName, status) => {
    const ReclaimForm = new ActionFormData()
        .title(kitName)
        .body(status ? status : 'api.kits.reclaim.components.default')
        .button('api.kits.reclaim.components.confirm.text', 'textures/emojis/CHECK.png')
        .button('api.kits.reclaim.components.return.text', 'textures/emojis/RETURN.png');
    ReclaimForm.show(player).then((res) => {
        var _a, _b;
        if (res.canceled)
            return FormKit(player);
        const pressedButton = res.selection;
        switch (pressedButton) {
            case 0:
                const ms = Date.now();
                const KitData = kits.read(kitName);
                const isAdmin = player.hasTag(adminTag);
                const items = KitData.items;
                //@ts-ignore
                const inventory = player.getComponent('inventory').container;
                //@ts-ignore
                const equipment = player.getComponent('equipment_inventory');
                if (!isAdmin && (KitData.requiredTag && KitData.requiredTag !== 'noReqTag' && !player.hasTag(KitData.requiredTag)))
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.noperms');
                const cooldown = (_b = Number((_a = player.getTags().find((tag) => tag.startsWith(`KA-Cooldown:${kitName}:`))) === null || _a === void 0 ? void 0 : _a.substring(12 + kitName.length + 1))) !== null && _b !== void 0 ? _b : null;
                if (!isAdmin && (cooldown && cooldown > Date.now()))
                    return ReclaimSelect(player, translate('inCooldown', [MS(cooldown - Date.now())]));
                if (!isAdmin) {
                    removeAllCooldownTags(player, kitName),
                        player.addTag(`KA-Cooldown:${kitName}:${Date.now() + KitData.cooldown}`);
                }
                if (inventory.emptySlotsCount < KitData.itemCount)
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.insufficientslots');
                if (!isAdmin && (KitData.onlyOnce && player.hasTag(`KA-ClaimedKit:${kitName}`)))
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.onlyonce');
                if (KitData.onlyOnce)
                    player.addTag(`KA-ClaimedKit:${kitName}`);
                let money = 0;
                try {
                    money = world.scoreboard.getObjective(EconomyObjective).getScore(player.scoreboardIdentity);
                }
                catch (_c) { }
                if (!isAdmin && ((KitData === null || KitData === void 0 ? void 0 : KitData.price) && (KitData === null || KitData === void 0 ? void 0 : KitData.price) > 0 && money < (KitData === null || KitData === void 0 ? void 0 : KitData.price)))
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.notenoughmoney');
                if (!isAdmin && ((KitData === null || KitData === void 0 ? void 0 : KitData.price) && (KitData === null || KitData === void 0 ? void 0 : KitData.price) > 0 && money >= (KitData === null || KitData === void 0 ? void 0 : KitData.price)))
                    player.runCommandAsync(`scoreboard players remove @s ${EconomyObjective} ${KitData.price}`);
                //Offhand check
                if (KitData.offhand && equipment.getEquipment(EquipmentSlot.offhand))
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.insufficientslots');
                const armor = KitData.armor;
                //Armor check
                if (armor.helmet && equipment.getEquipment(EquipmentSlot.head))
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.insufficientslots');
                if (armor.chest && equipment.getEquipment(EquipmentSlot.chest))
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.insufficientslots');
                if (armor.legs && equipment.getEquipment(EquipmentSlot.legs))
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.insufficientslots');
                if (armor.feet && equipment.getEquipment(EquipmentSlot.feet))
                    return ReclaimSelect(player, 'api.kits.errors.reclaim.insufficientslots');
                if (KitData.offhand)
                    equipment.setEquipment(EquipmentSlot.offhand, newItem(KitData.offhand));
                if (armor.helmet)
                    equipment.setEquipment(EquipmentSlot.head, newItem(armor.helmet));
                if (armor.chest)
                    equipment.setEquipment(EquipmentSlot.chest, newItem(armor.chest));
                if (armor.legs)
                    equipment.setEquipment(EquipmentSlot.legs, newItem(armor.legs));
                if (armor.feet)
                    equipment.setEquipment(EquipmentSlot.feet, newItem(armor.feet));
                for (const item of items) {
                    inventory.addItem(newItem(item));
                }
                if (!isAdmin && (KitData === null || KitData === void 0 ? void 0 : KitData.price) > 0) {
                    FormKit(player, translate('purchasedKitSucces', [kitName]));
                    return emitter.emit('kitPurchased', {
                        kitName,
                        price: KitData.price,
                        player: player,
                        executionTime: Date.now() - ms + 'ms'
                    });
                }
                FormKit(player, translate('reclaimSucces', [kitName]));
                emitter.emit('kitClaimed', {
                    kitName,
                    player: player,
                    executionTime: Date.now() - ms + 'ms'
                });
                break;
            case 1:
                ReclaimSelect(player);
                break;
        }
    });
};
