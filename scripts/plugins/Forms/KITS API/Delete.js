import { FormKit } from "./FormKit.js";
import { ModalFormData } from "@minecraft/server-ui";
import { kits } from "../../../lib/Script.js";
import { emitter } from "../../../main.js";
export const Delete = (player, status) => {
    var _a;
    const Kits = (_a = kits.allKeys()) !== null && _a !== void 0 ? _a : [];
    const KitNames = [];
    Kits === null || Kits === void 0 ? void 0 : Kits.forEach(kit => KitNames.push(kit));
    if (KitNames.length < 1)
        KitNames.push('none');
    const RemoveForm = new ModalFormData()
        .title('api.kits.delete.title')
        .dropdown('api.kits.delete.components.kits.label', KitNames, 0)
        .textField(status ? status : 'api.kits.delete.components.default', 'api.kits.delete.components.confirm.placeholder');
    RemoveForm.show(player).then((res) => {
        if (res.canceled)
            return FormKit(player);
        const ms = Date.now();
        if (KitNames[0] === 'none' && KitNames.length === 1)
            return FormKit(player, 'api.kits.errors.nokitsfound');
        const value = res.formValues[1], KitIndex = res.formValues[0];
        if (!value)
            return Delete(player);
        const validValues = ['CONFIRM', 'CONFIRMAR'];
        if (!validValues.includes(value))
            return Delete(player);
        if (!kits.has(KitNames[KitIndex]))
            return Delete(player);
        const KitData = kits.read(KitNames[KitIndex]);
        kits.delete(KitNames[KitIndex]);
        FormKit(player, 'api.kits.delete.succes');
        emitter.emit('kitDeleted', {
            kitName: KitNames[KitIndex],
            player: player,
            KitData,
            executionTime: Date.now() - ms + 'ms'
        });
    }).catch((r) => console.warn(r, r.stack));
};
