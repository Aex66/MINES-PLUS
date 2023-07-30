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
© Copyright 2023 all rights reserved. Do NOT steal, copy the code, or claim it as yours
Thank you
*/
import { system } from '@minecraft/server';
import Database from './lib/Database.js';
system.beforeEvents.watchdogTerminate.subscribe((res) => res.cancel = true);
export let settingsReg = null;
(async () => {
    settingsReg = await Database.registry('settings');
})();
import './plugins/commands/import.js';
import './plugins/mines/main.js';
//import './plugins/hologram/main.js'
