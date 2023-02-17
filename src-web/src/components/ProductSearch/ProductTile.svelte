<script lang="ts">
  import { formatPrice } from "./../../lib/Utils";
  import type { SealedProduct } from "../../lib/SealedProduct";
  import StoreLink from "../Shared/StoreLink.svelte";
  import { createEventDispatcher } from "svelte";

  export let product: SealedProduct;
  const dispatch = createEventDispatcher();
</script>

<div class="card card-side bg-base-100 shadow-xl h-72 foggy">
  <div class="flex rounded-l-xl bg-white items-center justify-center">
    <div class="m-2 w-48 h-48 lg:w-36 lg:h-36">
      <img
        class="object-contain h-48 w-48 lg:w-36 lg:h-36 cursor-pointer"
        src={`${product.img}`}
        alt={product.name}
        on:click={() => dispatch("click")}
        on:keypress={(e) => {
          if (e.key === "enter") {
            dispatch("click");
          }
        }}
      />
    </div>
  </div>
  <div class="card-body ">
    <div
      class="card-title lg:text-lg cursor-pointer"
      on:click={() => dispatch("click")}
      on:keypress={(e) => {
        if (e.key === "enter") {
          dispatch("click");
        }
      }}
    >
      {product.name}
    </div>
    <p>{formatPrice(product.price)}</p>
    <div class="card-actions justify-end">
      <StoreLink store="ebay" sealedProduct {product} />
      <StoreLink store="tcgp" sealedProduct {product} />
    </div>
  </div>
</div>
