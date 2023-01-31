import { Card, CardSearchResults, Price } from "./Card";
import type { Expansion, Series } from "./CardMeta";
import { writable } from "svelte/store";
import { baseURL, page as mainPage } from "./Utils";
import { timer } from "rxjs";

export class SearchTerms {
  public keyword: string = "";
  public selectedSets: Array<string> = [];
  public selectedRarities: Array<string> = [];
  public sort: string = "";
}

export class DbState {
  public data_ready: boolean = false;
  public prices_ready: boolean = false;
  public eta_version: string = "0.0.0";
  public data_version: number = 0;
  public price_version: number = 0;
  public msg: string = "";
}

/////////////
/*Meta data*/
/////////////

//Set options
export const setStore = writable(new Array<Expansion>());
//Series options
export const seriesStore = writable(new Array<Series>());
//Rarity options
export const rarityStore = writable(new Array<string>());
//database status (ensures db is ready and not updating)
export const dbStatus = writable(new DbState());

////////////////////////////////
/*Global card search variables*/
////////////////////////////////

//List of sets(expantions) selected
export const selectedSetsStore = writable(new Array<string>());
export let selectedSets = [];
selectedSetsStore.subscribe((val) => (selectedSets = val));
//List of Card Rarities selected
export const selectedRaritiesStore = writable(new Array<string>());
export let selectedRarities = [];
selectedRaritiesStore.subscribe((val) => (selectedRarities = val));
//Search term entered
export const searchTermStore = writable("");
export let searchTerm = "";
searchTermStore.subscribe((val) => (searchTerm = val));
//Sort button pressed
export const sortStore = writable("");
export let sort = "";
sortStore.subscribe((val) => (sort = val));
//Page selected
export const pageStore = writable(0);
export let page = 0;
pageStore.subscribe((val) => (page = val));
//Card Results
export const cardResultStore = writable(new CardSearchResults());
//Selected display option [case, table]
export const cardSearchDisplay = writable("grid");

/**
 * Init Card Card store and check database status
 */
export function initCardStore() {
  fetch(`${baseURL}/meta/init`, { method: "POST" }).then();
  statusLoop();
}

async function statusLoop() {
  let loop = timer(0, 300);
  let sub = loop.subscribe(async (_) => {
    let resp = await fetch(`${baseURL}/meta/db_status`);
    let status: DbState = await resp.json();
    let ready = status.data_ready && status.prices_ready;
    dbStatus.set(status);
    if (ready) {
      sub.unsubscribe();
      init_local();
      mainPage.set("cards");
      executeCardSearch();
      console.log(status);
    }
  });
}

export function executeCardSearch() {
  let url = new URL(`${baseURL}/pokemon/cards/${page}`);
  if (selectedSets.length !== 0) {
    url.searchParams.set(`expansions`, encodeURI(JSON.stringify(selectedSets)));
  }
  if (searchTerm !== "") {
    url.searchParams.set(`name`, searchTerm);
  }
  if (sort !== "") {
    url.searchParams.set("sort", sort);
  }
  if (selectedRarities.length !== 0) {
    url.searchParams.set(`rarities`, JSON.stringify(selectedRarities));
  }
  fetch(url.toString())
    .then((res) => res.json())
    .then(
      (data) => {
        cardResultStore.set(data);
      },
      (err) => {
        console.log(err);
      }
    );
}

export function init_local() {
  expansions()
    .then((data) => setStore.set(data))
    .catch((err) => console.log(`Failed to load sets \n ${err}`));
  rarities()
    .then((data) => rarityStore.set(data))
    .catch((err) => console.log(`Failed to load rarities\n${err}`));
  series()
    .then((data) => seriesStore.set(data))
    .catch((err) => console.log(`Failed to load series\n${err}`));
}

/**
 * Get set expantions
 * @returns
 */
function expansions(): Promise<Expansion[]> {
  return new Promise<Expansion[]>((resolve, reject) => {
    fetch(`${baseURL}/pokemon/expansions`)
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

/**
 * Get Series
 * @returns
 */
function series(): Promise<Series[]> {
  return new Promise<Series[]>((resolve, reject) => {
    fetch(`${baseURL}/pokemon/series`)
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

/**
 * Get List of Pokemon Rarities
 * @returns List of rarities
 */
function rarities(): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    fetch(`${baseURL}/pokemon/card/rarities`)
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
}

/**
 * Get card prices
 * @param card
 * @param start
 * @param end
 * @returns
 */
export function getCardPrices(card: Card): Promise<Price[]> {
  return new Promise<Price[]>((reslove, reject) => {
    let url = new URL(
      `${baseURL}/pokemon/card/price/${encodeURIComponent(card.cardId)}`
    );
    fetch(url)
      .then((res) => res.json())
      .then((data) => reslove(data))
      .catch((err) => reject(err));
  });
}
