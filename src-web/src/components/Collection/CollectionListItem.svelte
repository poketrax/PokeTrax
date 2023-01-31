<script lang="ts">
  import type { Card } from "../../lib/Card";
  import { addCardCollection } from "../../lib/CollectionStore";
  import { Energy, CardImage, PokeRarity, Price } from "tcg-case";
  import { baseURL, getTextColorBgContrast } from "../../lib/Utils";
  import {
    formatEnergy,
    formatDate,
    formatExpansionNumber,
  } from "../../lib/Utils";
  import { getTagFromCard } from "../../lib/CollectionStore";
  import CountControl from "./CountControl.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let card: Card;
  export let id: number;
  export let revFoil = "";

  let expNumber = "";
  $: formatExpansionNumber(card.expCardNumber, card.expName).then(
    (val) => (expNumber = val)
  );
</script>

<tr>
  <td>
    <CardImage
      height="96px"
      width="65px"
      class="rounded-md object-contain"
      overlay={revFoil}
      cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
        card.expName
      )}/${encodeURI(card.cardId)}`}
      {id}
      on:click={() => dispatch("click")}
    />
  </td>
  <td>
    <Energy class="mr-2 h-8 w-8" type={formatEnergy(card)} />
  </td>
  <td>
    <div class="text-xl text-ellipsis overflow-hidden sm:w-48">{card.name}</div>
    <div class="badge badge-ghost badge-sm">{card.variant}</div>
  </td>
  <td>
    {#each getTagFromCard(card.tags) as tag}
      <span
        class="badge badge-ghost badge-sm"
        style="background-color: {tag.color}; color: {getTextColorBgContrast(
          tag.color
        )}">{tag.name}</span
      >
    {/each}
  </td>
  <td>
    <CountControl
      class="w-64"
      bind:count={card.count}
      on:change={() => addCardCollection(card)}
    />
  </td>
  <td>
    {formatDate(card.releaseDate)}
  </td>
  <td>
    <Price price={card.price} paid={card.paid} />
  </td>
  <th>
    <div class="flex flex-col items-center mr-4">
      <img
        class="w-24"
        src="{baseURL}/pokemon/expansion/logo/{encodeURIComponent(
          card.expName
        )}"
        alt={card.expName}
      />
      <div class="flex">
        <img
          class="w-6 h-6"
          src={`${baseURL}/pokemon/expansion/symbol/${encodeURI(card.expName)}`}
          alt={card.expName}
        />
        <div class="w-2" />
        {expNumber}
        <div class="w-2" />
        <PokeRarity rarity={card.rarity} />
      </div>
    </div>
  </th>
</tr>
