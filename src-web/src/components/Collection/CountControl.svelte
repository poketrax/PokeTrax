<script lang="ts">
  import Icon from "./../Shared/Icon.svelte";
  import { createEventDispatcher } from "svelte";
  import { mdiPlus, mdiMinus } from "@mdi/js";

  const dispatch = createEventDispatcher();

  export let count = 0;
  let clazz = "";
  export { clazz as class };
</script>

<div class="form-control {clazz}">
  <label class="input-group">
    <span>Count</span>
    <input
      type="number"
      value={count}
      min="0"
      class="input input-bordered w-full"
    />
    <button
      class="btn"
      on:click={() => {
        count++;
        dispatch("change");
      }}
    >
      <Icon class="w-4 h-4" path={mdiPlus} />
    </button>
    <button class="btn" disabled={count <= 0} on:click={() => count--}>
      <Icon class="w-4 h-4" path={mdiMinus} />
    </button>
  </label>
</div>
