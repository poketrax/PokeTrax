import { writable } from "svelte/store";
import type { Card } from "./Card";
import { CardSearchResults } from "./Card";
import type { Tag } from "./Collection";
import { baseURL } from "./Utils";

export let tagOptionStore = writable(new Array<Tag>());

export const selectedTagsStore = writable(new Array<string>());
export let selectedTags = [];
selectedTagsStore.subscribe((val) => (selectedTags = val));

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
//Value of Searched Collection
export const collectionValue = writable(0);

let tagOpions = new Array<Tag>();
tagOptionStore.subscribe((val) => (tagOpions = val));

/**
 * Init Card Card store and check database status
 */
export function initCollectionStore() {
  executeCardSearch();
  getTagOptions();
}

export function getTagOptions() {
  fetch(`${baseURL}/pokemon/tags`)
    .then((res) => res.json())
    .then((data) => {
      tagOptionStore.set(data);
    });
}

export function addTag(tag: Tag) {
  fetch(`${baseURL}/pokemon/tag`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag),
  }).then(() => getTagOptions());
}

export function deleteTag(tag: Tag) {
  fetch(`${baseURL}/pokemon/tag`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag),
  }).then(() => {
    getTagOptions();
    executeCardSearch();
  });
}

export function executeCardSearch() {
  let url = new URL(`${baseURL}/pokemon/collection/cards/${page}`);
  let valueUrl = new URL(`${baseURL}/pokemon/collection/value`)
  if (selectedSets.length !== 0) {
    url.searchParams.set(`expansions`, JSON.stringify(selectedSets));
    valueUrl.searchParams.set(`expansions`, JSON.stringify(selectedSets));
  }
  if (searchTerm !== "") {
    url.searchParams.set(`name`, searchTerm);
    valueUrl.searchParams.set(`name`, searchTerm);
  }
  if (sort !== "") {
    url.searchParams.set("sort", sort);
  }
  if (selectedRarities.length !== 0) {
    url.searchParams.set(`rarities`, JSON.stringify(selectedRarities));
    valueUrl.searchParams.set(`rarities`, JSON.stringify(selectedRarities));
  }
  if (selectedTags.length !== 0) {
    url.searchParams.set(`tags`, JSON.stringify(selectedTags));
    valueUrl.searchParams.set(`tags`, JSON.stringify(selectedTags));
  }
  fetch(url.toString())
    .then((res) => res.json())
    .then((json) => cardResultStore.set(json));
  fetch(valueUrl.toString())
    .then((res) => res.json())
    .then((json) => collectionValue.set(json.value))
}

export function addCardCollection(card: Card, mergeTags?: boolean) {
  let url = new URL(`${baseURL}/pokemon/collection/cards`);

  if (mergeTags! != null) {
    url.searchParams.set("tag_merge", `${mergeTags}`);
  }
  fetch(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).then(() => executeCardSearch());
}

export function removeCardCollection(card: Card) {
  fetch(`${baseURL}/pokemon/collection/cards`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  }).then(() => executeCardSearch());
}

export function getTagFromCard(tags: string[]): Tag[] {
  let tagArray = new Array<Tag>();
  for (let tagName of tags) {
    let tag = tagOpions.find((val) => val.name === tagName);
    if (tag != null) {
      tagArray.push(tag);
    }
  }
  return tagArray;
}

export function cardInCollection(card: Card): Promise<boolean> {
  return new Promise<boolean>((res, rej) => {
    let url = new URL(`${baseURL}/pokemon/collection/cards/${page}`);
    url.searchParams.set(`name`, card.cardId.replaceAll(`'`, `''`));
    fetch(url.toString())
      .then((res) => res.json())
      .then((json) => {
        res(json.count > 0)
      }).catch((e) => rej(e))
  });
}
