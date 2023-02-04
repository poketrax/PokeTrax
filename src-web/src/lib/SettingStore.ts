import { writable } from "svelte/store";

export let bgOptions = new Map([
    ["Pikachu VMAX", "assets/backgrounds/Pikachu-VMAX.jpg"],
    ["Alolan Vulpix", "assets/backgrounds/Alolan-Vulpix-VSTAR.jpg"],
    ["Charizard VSTAR", "assets/backgrounds/Charizard-VSTAR.jpg"],
    ["Mew VMAX", "assets/backgrounds/Mew-VMAX.jpg"],
    ["Rayquaza", "assets/backgrounds/Rayquaza.jpg"],
    ["Umbreon", "assets/backgrounds/Umbreon.jpg"],
    ["Coast", "assets/backgrounds/coast.jpg"],
    ["Forest", "assets/backgrounds/forest.jpg"],
    ["Canyon", "assets/backgrounds/canyon.jpg"],
    ["Volcano", "assets/backgrounds/volcano.jpg"]
]);

export let backgroundStore = writable(["Coast","assets/backgrounds/coast.jpg"]);

