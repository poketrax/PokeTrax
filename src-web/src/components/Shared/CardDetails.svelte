<script lang="ts">
  import type { Card } from "../../lib/Card.js";
  import { baseURL, formatExpansionNumber } from "./../../lib/Utils.js";
  import { PokeRarity } from "tcg-case";

  export let card: Card;
  let expNum: string;
  $: formatExpansionNumber(card.expCardNumber, card.expName).then(
    (val) => (expNum = val)
  );
</script>

<div class="flex flex-col items-center mr-4">
  <img
    class="w-24"
    src="{baseURL}/pokemon/expansion/logo/{encodeURIComponent(card.expName)}"
    alt={card.expName}
  />
  <div class="flex items-center">
    <img
      class="w-6 h-6 object-contain"
      src={`${baseURL}/pokemon/expansion/symbol/${encodeURI(card.expName)}`}
      alt={card.expName}
    />
    <div class="w-2" />
    {expNum}
    <div class="w-2" />
    <PokeRarity rarity={card.rarity} />
  </div>
</div>
