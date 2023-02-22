<script lang="ts">
  import { mdiGrid, mdiFormatListCheckbox } from "@mdi/js";
  import Icon from "../../components/Shared/Icon.svelte";
  import type { Writable } from "svelte/store";
  export let displayStore: Writable<string>;

  const selected = "btn-active";
  let grid = "";
  let list = "";

  displayStore.subscribe((option) => setDisplay(option, false));

  function setDisplay(option: string, commit: boolean) {
    if (option === "grid") {
      grid = selected;
      list = "";
    } else {
      grid = "";
      list = selected;
    }
    if (commit) displayStore.set(option);
  }
</script>

<div class="btn-group">
  <button
    id="display-grid"
    class="btn {grid}"
    on:click={() => {
      setDisplay("grid", true);
    }}
  >
    <Icon path={mdiGrid} class="h-6 w-6" />
  </button>
  <button
    id="display-list"
    class="btn {list}"
    on:click={() => {
      setDisplay("list", true);
    }}
  >
    <Icon path={mdiFormatListCheckbox} class="h-6 w-6" />
  </button>
</div>
