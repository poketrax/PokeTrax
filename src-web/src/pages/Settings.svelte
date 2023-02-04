<script lang="ts">
  import Icon from "./../components/Shared/Icon.svelte";
  import { mdiCog } from "@mdi/js";
  import { bgOptions, backgroundStore } from "../lib/SettingStore";
  import { onMount } from "svelte";

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
  <div class="form-control">
    <label class="label">
      <span class="label-text">Background Image</span>
    </label>
    <label class="input-group ">
      <span class="w-24">Image</span>
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
  </div>
</div>
