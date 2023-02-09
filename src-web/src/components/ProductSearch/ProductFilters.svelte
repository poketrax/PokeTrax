<script lang="ts">
  import type { Writable } from "svelte/store";

  //Search Terms
  export let searchTermStore: Writable<string>;
  let searchTerm = "";
  searchTermStore.subscribe((val) => (searchTerm = val));
  //Page store
  export let pageStore: Writable<number>;
  //Execute search function
  export let executeSearch: () => void;

  function keywordSearch() {
    searchTermStore.set(searchTerm);
    pageStore.set(0);
    executeSearch();
  }
</script>

<div class="p-4 flex">
  <input
    type="text"
    placeholder="🔍 Search"
    class="input input-bordered w-96 "
    bind:value={searchTerm}
    on:input={keywordSearch}
  />
</div>
<div class="p-4" />
