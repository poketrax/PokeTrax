<script lang="ts">
	import ImgOption from './../Shared/AutoMultiSelect/ImgOption.svelte';
  import { setStore, rarityStore } from "../../lib/CardSearchStore";
  import type { Writable } from "svelte/store";
  import { baseURL } from "../../lib/Utils";
  import AutoMultiSelect from "../Shared/AutoMultiSelect/AutoMultiSelect.svelte";
  import type { SelectOption } from "../Shared/AutoMultiSelect/SelectOption";
  import RarityOption from '../Shared/AutoMultiSelect/RarityOption.svelte';

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
  let setOptions : SelectOption[];
  setStore.subscribe((data) => {
    setOptions = data.map((opt) => {
      let date = new Date(Date.parse(opt.releaseDate))
      let sort = opt.releaseDate !== "" ? Date.parse(date.toISOString()) : 0
      return {
        value: opt.name,
        metaData: { imgSrc: `${baseURL}/pokemon/expansion/symbol/${opt.name}` },
        sortProp:  sort,
        component: ImgOption
      };
    });
  });
  
  //Sets rarity(expantion) options
  let rarityOptions = [];
  rarityStore.subscribe((data) => {
    rarityOptions = data.map((opt) => {
      return {
        value: opt,
        sortProp: opt,
        component: RarityOption
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
    id="search"
    type="text"
    placeholder="Search"
    class="input input-bordered rounded-sm flex-grow max-w-x"
    autocomplete="off"
    bind:value={searchTerm}
    on:input={keywordSearch}
  />
  <div class="w-2" />
  <AutoMultiSelect options={setOptions} dataStore={selSetsStore} class="dropdown-end" label="Sets" on:change={filterSets}/>
  <div class="w-2" />
  <AutoMultiSelect options={rarityOptions} dataStore={selRareStore} class="dropdown-end" label="Rarity" on:change={filterRarity}/>
</div>
