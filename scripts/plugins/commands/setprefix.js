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
import { sleep } from "../../extras/Utils.js";
import { Command } from "../../lib/Command.js";
import { settingsReg } from "../../main.js";
new Command({
    name: "setprefix",
    description: "Sets the command prefix",
    aliases: [],
    admin: true
}, async (plr, args) => {
    var _a;
    if (!args[0])
        return plr.sendMessage('§cSpecify the prefix!');
    if (args[0].startsWith('/'))
        return plr.sendMessage('§cYou can\'t use "/" as prefix');
    if (args[0].length > 10)
        return plr.sendMessage('§cYou can\'t set a prefix that long!');
    if ((_a = settingsReg.findMany(0)) === null || _a === void 0 ? void 0 : _a.length)
        settingsReg.deleteMany(settingsReg.findMany(0));
    plr.sendMessage('§eThe server is updating the prefix...');
    await sleep(5);
    plr.sendMessage(`§aThe prefix has been updated to §e"${args[0]}"`);
    settingsReg.write(args[0], 0);
});
