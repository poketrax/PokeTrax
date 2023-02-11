import { writable } from "svelte/store";
import { baseURL } from "./Utils";

export let bgOptions = [
  "assets/backgrounds/Alolan-Vulpix-VSTAR.jpg",
  "assets/backgrounds/Charizard-VSTAR.jpg",
  "assets/backgrounds/Rayquaza.jpg",
  "assets/backgrounds/Umbreon.jpg",
  "assets/backgrounds/coast.jpg",
  "assets/backgrounds/forest.jpg",
  "assets/backgrounds/canyon.jpg",
  "assets/backgrounds/volcano.jpg",
  "assets/backgrounds/Pikachu-VMAX.jpg",
  "assets/backgrounds/Mew-VMAX.jpg",
];
export class Settings {
  public admin: boolean;
  public admin_file: string;
  public bg_img: string;
}

export let settingStore = writable<Settings>({
  admin: false,
  admin_file: "",
  bg_img: "assets/backgrounds/coast.jpg",
});

/**
 * Get Settings 
 */
export async function initSettingStore() {
  fetch(`${baseURL}/meta/settings`)
    .then((res) => res.json())
    .then((json) => settingStore.set(json))
    .catch((e) => console.log(e));
}

/**
 * Set Settings
 * @param update 
 */
export async function setSetting(update: Settings) {
  settingStore.set(update);
  fetch(`${baseURL}/meta/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  }); 
}

export async function clearCardCache(set?: string){
  let url = `${baseURL}/meta/card_cache`
  if(set != null){
    url = `${url}/${set.replaceAll(" ", "-")}`
  }
  fetch(url,{method: "DELETE"});
}

export async function clearExpCache(){
  let url = `${baseURL}/meta/exp_cache`
  fetch(url,{method: "DELETE"});
}