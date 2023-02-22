<script lang="ts">
  import type { Card } from "../../lib/Card";
  import ebay from "../../assets/brands/ebay.png";
  import tcgp from "../../assets/brands/tcgp.png";
  import { openUrl } from "../../lib/Utils";
  import type { SealedProduct } from "../../lib/SealedProduct";
  export let store: string;
  export let sealedProduct: boolean = false;
  export let product: SealedProduct | Card

  function normalizeName(): string {
    let normailizer = /([a-zA-Z\s]+)(?:\([a-zA-Z\s]+\))?(?:\-[a-zA-Z\s]+)?/g;
    let found = [...product.name.matchAll(normailizer)];
    if (found == null || found[0] == null) return product.name;
    else return found[0][1].toString();
  }

  function ebayUrl(mod: string): string {
    let kw = "";
    if (sealedProduct) {
      kw = product.name;
    } else {
      kw = `${normalizeName()} ${(product as Card).expCardNumber} ${
        product.expName == "Celebrations" ? "Celebrations" : ""
      } ${mod}`;
    }
    let ebayUrl = new URL("https://www.ebay.com/sch");
    ebayUrl.searchParams.set("kw", kw);
    ebayUrl.searchParams.set("mkevt", "1");
    ebayUrl.searchParams.set("mkcid", "1");
    ebayUrl.searchParams.set("mkrid", "711-53200-19255-0");
    ebayUrl.searchParams.set("campid", "5338928550");
    ebayUrl.searchParams.set("toolid", "10001");
    ebayUrl.searchParams.set("customid", `pt-cardtrax`);
    ebayUrl.searchParams.set("_sop", "15");
    return ebayUrl.toString();
  }

  
</script>

{#if store === "tcgp"}
  <button
    class="btn btn-ghost m-1 w-20 h-12"
    on:click={() =>
      openUrl("https://tcgplayer.com/product/" + product.idTCGP.toFixed(0))}
  >
    <div class="flex w-full h-full p-1 align-center justify-items-center">
      <img class="object-contain" src={tcgp} alt="tcgp" />
    </div>
  </button>
{:else if store === "ebay" && !sealedProduct}
  <div class="dropdown dropdown-top z-[150] safari-z-200">
    <!--
      Ignore Warnings Apple is a bunch of snobs and won't fix the behavoir of buttons and
      think they shouldn't be focusable so we are breaking some rules with regaurds to tabindexies 
    -->
    <label tabindex="0" class="btn btn-ghost m-1 w-20 h-12">
      <div class="flex w-full h-full p-1 align-center justify-items-center">
        <img class="object-contain" src={ebay} alt="tcgp" />
      </div>
    </label>
    <ul
      tabindex="0"
      class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 "
    >
      <li>
        <a on:click={() => openUrl(ebayUrl("-PSA -BGS -CGC"))}>RAW</a>
      </li>
      <li>
        <a on:click={() => openUrl(ebayUrl("(PSA,BGS,CGC)"))}>ALL GRADED</a>
      </li>
      <li>
        <a on:click={() => openUrl(ebayUrl("PSA -BGS -CGC"))}>PSA</a>
      </li>
      <li>
        <a on:click={() => openUrl(ebayUrl("-PSA -BGS CGC"))}>CGC</a>
      </li>
      <li>
        <a on:click={() => openUrl(ebayUrl("-PSA BGS -CGC"))}>BGS</a>
      </li>
    </ul>
  </div>
{:else if store === "ebay" && sealedProduct}
  <button
    class="btn btn-ghost m-1 w-20 h-12"
    on:click={() => openUrl(ebayUrl(""))}
  >
    <div class="flex w-full h-full p-1 align-center justify-items-center">
      <img class="object-contain" src={ebay} alt="tcgp" />
    </div>
  </button>
{/if}

<style>
  .safari-z-200 {
    transform: translate3d(0, 0, 200px);
  }
</style>
