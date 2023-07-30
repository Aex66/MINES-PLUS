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
import { setTickTimeout } from "../../extras/Scheduling.js";
import { Command } from "../../lib/Command.js";
import { mine } from "./form.js";
new Command({
    name: "mines",
    description: "open mines form",
    aliases: [],
    admin: true
}, (plr, args) => {
    plr.sendMessage('§l§aMINES+ >§r §eClose chat to open form!');
    setTickTimeout(() => mine(plr), 20);
});
