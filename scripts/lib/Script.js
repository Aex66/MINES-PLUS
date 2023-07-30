import Database from "./Database.js";
export let kits = null;
(async function () {
    kits = await Database.register('kits');
})();
