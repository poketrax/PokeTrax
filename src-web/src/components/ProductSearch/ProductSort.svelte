<script lang="ts">
  import type { Writable } from "svelte/store";

  let sort = "";
  let name = "";
  let price = "";
  let priceDirection = "";
  let selected = "btn-active";

  export let sortStore: Writable<string>;
  sortStore.subscribe((val) => (sort = val));
  export let executeSearch: () => void;

  function setSort(option) {
    switch (option) {
      case "name":
        if (sort.includes("name")) {
          sortStore.set("");
          name = "";
          executeSearch();
        } else {
          sortStore.set("name");
          name = selected;
          priceDirection = "";
          price = "";
          executeSearch();
        }
        break;
      case "price":
        if (sort.includes("priceDSC")) {
          sortStore.set("");
          priceDirection = "";
          price = "";
          executeSearch();
        } else if (sort.includes("priceASC")) {
          sortStore.set("priceDSC");
          priceDirection = "⬇︎";
          executeSearch();
        } else {
          sortStore.set("priceASC");
          priceDirection = "⬆︎";
          name = "";
          price = selected;
          executeSearch();
        }
        break;
    }
  }
</script>

<div class="btn-group">
  <button
    class="btn {name}"
    on:click={() => {
      setSort("name");
    }}
  >
    Name
  </button>
  <button
    class="btn {price}"
    on:click={() => {
      setSort("price");
    }}
  >
    $ {priceDirection}
  </button>
</div>
