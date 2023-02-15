<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "../Icon.svelte";
  import { mdiMenuDown } from "@mdi/js";
  import type { Writable } from "svelte/store";
  import type { SelectOption } from "./SelectOption";

  export let label: string;
  export let options: SelectOption[];
  export let dataStore: Writable<string[]>;
  const dispatch = createEventDispatcher();

  let displayedOptions: SelectOption[] = options;
  let searchTerm = ""

  $:sortOptions(searchTerm);

  let selected = new Array<string>();
  dataStore.subscribe((val) => (selected = val));

  function selectedStyle(option): string {
    if (selected.includes(option.name)) return "bg-primary";
    return "";
  }

  /**
   * Sorts and filters options, filters out items that are not in the search box, except selected items.
   * Sorts items selected first and by sort prop next
   * @param searchTerm
   */
  function sortOptions(searchTerm: string){
    displayedOptions = 
      options
      .filter(opt => {return (
        searchTerm === "" 
        || opt.value.toLowerCase().includes(searchTerm.toLowerCase())
        || selected.find(val => val === opt.value))})
      .sort((a,b) => {
        if(selected.find( v => a.value === v)) return -1;
        if(selected.find( v => b.value === v)) return 1;
        return a.sortProp < b.sortProp ? 1 : -1
      })
  }

  function onCheck(event) {
    if (event.target.checked) {
      selected.push(event.target.id);
      dataStore.set(selected);
      dispatch("change", event);
    } else {
      selected.splice(selected.indexOf(event.target.id), 1);
      dataStore.set(selected);
      dispatch("change", event);
    }
  }
</script>

<div class="input-group h-12 z-20 w-fit">
  <span>{label}</span>
  <div class="input dropdown pl-0 pr-1">
    <span class="h-12 bg-base-100" tabindex="0" on:click={() => sortOptions(searchTerm)}>
      <Icon path={mdiMenuDown} class="h-6 w-6" />
    </span>
    <div
      class="dropdown-content shadow bg-base-100 rounded-box w-80 h-max max-h-96 overflow-y-scroll"
    >
      <input class="input input-xs mt-2 ml-4 w-72 input-bordered" placeholder="Search" bind:value={searchTerm} on:change={() => sortOptions(searchTerm)}/>
      <div class="h-2" />
      {#each displayedOptions as option}
        <div class="flex items-center  {() => selectedStyle(option)}" tabindex="0">
          <input
            type="checkbox"
            id={option.value}
            checked={selected.includes(option.value)}
            class="checkbox border-solid ml-4 border-2 roun border-black"
            style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem"
            on:click={onCheck}
          />
          {#if option.component}
            <svelte:component
              this={option.component}
              metaData={option.metaData}
              label={option.value}
            />
          {:else}
            <span class="bg-base-100">{option.value}</span>
          {/if}
        </div>
        <div class="h-1" />
      {/each}
    </div>
  </div>
</div>
