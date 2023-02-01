<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Icon from "./Icon.svelte";
  import { mdiMenuDown } from "@mdi/js";
  import type { Writable } from "svelte/store";
  import { PokeRarity } from "tcg-case";
  export let label: string;
  export let rarity: boolean = false;
  export let options: any[];
  export let dataStore: Writable<string[]>;

  const dispatch = createEventDispatcher();

  let selected = new Array<string>();
  dataStore.subscribe((val) => (selected = val));

  function selectedStyle(option): string {
    if (selected.includes(option.name)) return "bg-primary";
    return "";
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
    <span tabindex="0" class="h-12 bg-base-100">
      <Icon path={mdiMenuDown} class="h-6 w-6" />
    </span>
    <div
      tabindex="0"
      class="dropdown-content shadow bg-base-100 rounded-box w-80 h-96 overflow-y-scroll"
    >
      {#each options as option}
        <div class="flex items-center {() => selectedStyle(option)}">
          <input
            type="checkbox"
            id={option.name}
            checked={selected.includes(option.name)}
            class="checkbox border-solid ml-4 border-2 roun border-black"
            style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem"
            on:click={onCheck}
          />
          {#if rarity}
            <PokeRarity class="ml-2 w-6 h-6" rarity={option.name} />
          {/if}
          {#if option.icon != null}
            <img class="h-4 w-4 ml-2 mr-2" src={option.icon} alt="" />
          {/if}
          <span class="bg-transparent">
            {option.name}
          </span>
        </div>
        <div class="h-1" />
      {/each}
      <div class="h-1" />
    </div>
  </div>
</div>
