<script lang="ts">
  import "@carbon/styles/css/styles.css";
  import "@carbon/charts/styles.css";
  import { LineChart } from "@carbon/charts-svelte";
  import { ScaleTypes } from "@carbon/charts/interfaces";
  import { mdiClose } from "@mdi/js";
  import Icon from "../Shared/Icon.svelte";
  import { formatPrice } from "../../lib/Utils";
  import StoreLink from "../Shared/StoreLink.svelte";
  import type { SealedProduct } from "../../lib/SealedProduct";
  import { getProductChartData } from "../../lib/CardSearchStore";

  export let product: SealedProduct;
  export let show: boolean;
  let chartData: any[];

  $: getProductChartData(product).then(
    (val) => {
      chartData = val
    }
  )
</script>

<input type="checkbox" id="dialog" class="modal-toggle" bind:checked={show} />
<label for="dialog" class="modal cursor-pointer">
  <label class="modal-box relative w-fit max-w-5xl overflow-hidden" for="">
    <div>
      <div
        class="flex items-center m-2 p-3 bg-repeat"
        style={`background-image: url(\"assets/revholo/trainer-rev.png\")`}
      >
        <span class="text-xl">{product.name}</span>
        <div class="grow" />
        <button
          id={`close-card-dialog`}
          aria-label="Close Card Dialog"
          class="btn rounded-full"
          on:click={() => {
            show = false;
          }}
        >
          <Icon path={mdiClose} class="w-4 h-4" />
        </button>
      </div>
      <div class="flex justify-center items-center">
        <div>
          <img
            class="object-contain h-96 w-96"
            src={`${product.img}`}
            alt={product.name}
          />
        </div>
        <div class="ml-2">
          <div class="flex">
            <div class="grow" />
            <span>Market Price: {formatPrice(product.price)}</span>
            <div class="w-2" />
          </div>
          <div class="flex">
            <LineChart
              data={chartData}
              options={{
                title: "Prices",
                height: "350px",
                width: "500px",
                axes: {
                  bottom: {
                    title: "Date",
                    mapsTo: "key",
                    scaleType: ScaleTypes.TIME,
                  },
                  left: {
                    title: "Price",
                    mapsTo: "value",
                    scaleType: ScaleTypes.LINEAR,
                  },
                },
              }}
            />
          </div>
          <div
            class="h-content ml-2 mb-2 w-[500px] overflow-x-auto overflow-y-auto"
          >
            <table class="table table-zebra table-compact w-full">
              <tr>
                <td>Name</td>
                <td>{product.name}</td>
              </tr>
              <tr>
                <td>Expansion</td>
                <td>{product.expName}</td>
              </tr>
              <tr>
                <td>Product Type</td>
                <td>{product.productType}</td>
              </tr>
              <tr>
                <td>Market Price</td>
                <td>{product.price}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <div class="h-12">
        <StoreLink {product} store="tcgp" />
        <StoreLink {product} store="ebay" />
      </div>
    </div>
  </label>
</label>
