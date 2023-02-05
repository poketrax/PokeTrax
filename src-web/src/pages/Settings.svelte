<script lang="ts">
	import { baseURL } from './../lib/Utils';
  import { setStore } from "./../lib/CardSearchStore";
  import Icon from "./../components/Shared/Icon.svelte";
  import { mdiCog } from "@mdi/js";
  import { bgOptions, backgroundStore } from "../lib/SettingStore";
  import { onMount } from "svelte";
  import AutoMultiSelect from "../components/Shared/AutoMultiSelect/AutoMultiSelect.svelte";
  import { writable } from "svelte/store";
  import type { SelectOption } from "../components/Shared/AutoMultiSelect/SelectOption";
  import ImgOption from '../components/Shared/AutoMultiSelect/ImgOption.svelte';

  let multiOps = new Array<SelectOption>();

  setStore.subscribe((val) => {
    multiOps = val.map((exp) => {
      return {
        value: exp.name,
        metaData: { imgSrc: `${baseURL}/pokemon/expansion/symbol/${exp.name}` },
        sortProp: Date.parse(exp.releaseDate),
        component: ImgOption
      };
    });
  });
  let selectedOps = writable(new Array<string>());

  let bgSelector;

  onMount(() => {
    backgroundStore.subscribe((val) => {
      bgSelector.value = val[0];
    });
  });

  function updateBgImage() {
    backgroundStore.set([bgSelector.value, bgOptions.get(bgSelector.value)]);
  }
</script>

<div class="foggy w-full h-[calc(100vh-4rem)] pt-2 px-2">
  <div class="navbar bg-base-100 rounded-md">
    <Icon path={mdiCog} class="w-6 m-2" />
    <span class="normal-case text-xl">Settings</span>
  </div>
  <div class="h-4" />
  <label class="input-group ">
    <span class="w-48 bg-primary">Background Image</span>
    <select
      class="select select-bordered w-96"
      on:change={updateBgImage}
      bind:this={bgSelector}
    >
      {#each [...bgOptions.keys()] as opt}
        <option>{opt}</option>
      {/each}
    </select>
  </label>
  <AutoMultiSelect options={multiOps} dataStore={selectedOps} label="test" />
</div>
