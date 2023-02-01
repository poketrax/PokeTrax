<script lang="ts">
  import { setStore, rarityStore } from "../../lib/CardSearchStore";
  import MultiSelect from "../Shared/MultiSelect.svelte";
  import type { Writable } from "svelte/store";
  import { baseURL } from "../../lib/Utils";

  //Selected Rarities
  export let selRareStore: Writable<string[]>;
  //Selected Sets(expantions)
  export let selSetsStore: Writable<string[]>;
  //Search Terms
  export let searchTermStore: Writable<string>;
  let searchTerm = "";
  searchTermStore.subscribe((val) => (searchTerm = val));
  //Page store
  export let pageStore: Writable<number>;
  //Execute search function
  export let executeSearch: () => void;

  //Set (expantion options)
  let setOptions = [];
  setStore.subscribe((data) => {
    setOptions = data.map((opt) => {
      return {
        name: opt.name,
        value: opt.name,
        icon: baseURL + "/pokemon/expansion/symbol/" + opt.name,
      };
    });
  });
  //Sets rarity(expantion) options
  let rarityOptions = [];
  rarityStore.subscribe((data) => {
    rarityOptions = data.map((opt) => {
      return {
        name: opt,
        value: opt,
      };
    });
  });

  function filterRarity() {
    pageStore.set(0);
    executeSearch();
  }

  function filterSets() {
    pageStore.set(0);
    executeSearch();
  }

  function keywordSearch() {
    searchTermStore.set(searchTerm);
    pageStore.set(0);
    executeSearch();
  }
</script>

<div class="flex w-full">
  <input
    type="text"
    placeholder="🔍 Search"
    class="input input-bordered flex-grow max-w-xs"
    autocomplete="off"
    bind:value={searchTerm}
    on:input={keywordSearch}
  />
  <div class="w-2" />
  <MultiSelect
    label="Sets"
    options={setOptions}
    dataStore={selSetsStore}
    on:change={filterSets}
  />
  <div class="w-2" />
  <MultiSelect
    label="Rarity"
    rarity
    options={rarityOptions}
    dataStore={selRareStore}
    on:change={filterRarity}
  />
</div>
