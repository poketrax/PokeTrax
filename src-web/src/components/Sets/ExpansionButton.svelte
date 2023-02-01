<script lang="ts">
  import {
    selectedSetsStore,
    executeCardSearch,
  } from "../../lib/CardSearchStore";
  import { baseURL, page } from "../../lib/Utils";
  export let name: string;

  function clickSet() {
    selectedSetsStore.set([name]);
    executeCardSearch();
    page.set("cards");
  }
</script>

<div
  class="relative max-w-32 h-24 border-solid border-2 rounded-lg hover:bg-gray-300 border-gray-400 bg-gray-200"
>
  <div class="absolute w-full h-24">
    <div class="h-24 w-full flex flex-col" on:click={clickSet}>
      <div class="w-6 grow" />
      <div class="flex">
        <div class="h-6 grow" />
        <img
          class="h-6 w-6 m-2 object-contain"
          src="{baseURL}/pokemon/expansion/symbol/{encodeURIComponent(name)}"
          alt={name}
        />
      </div>
    </div>
  </div>
  <div class="w-full h-full p-4 flex align-center justify-items-center">
    <img
      class="object-contain"
      src="{baseURL}/pokemon/expansion/logo/{encodeURIComponent(name)}"
      alt={name}
    />
  </div>
</div>
