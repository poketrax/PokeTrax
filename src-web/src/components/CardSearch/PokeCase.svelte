<script lang="ts">
  import type { Tag } from "../../lib/Tag";
  import {
    CardCase,
    Energy,
    CardImage,
    PokeRarity,
    CardGradeStamp,
  } from "tcg-case";
  import { Grade } from "../../lib/CardMeta";
  import {
    formatEnergy,
    formatPrice,
    baseURL,
    modern_path_rev,
  } from "../../lib/Utils";
  import { createEventDispatcher } from "svelte";
  import Icon from "../Shared/Icon.svelte";
  import type { Card } from "../../lib/Card";
  import { mdiPlus, mdiPencil, mdiCheck } from "@mdi/js";
  import { cardInCollection } from "../../lib/CollectionStore";

  const dispatch = createEventDispatcher();

  export let card: Card;
  export let alt: string;
  export let edit = false;
  export let collection = false;
  export let revFoil = "";
  export let tags = new Array<Tag>();

  let grade: Grade = null;
  let inCollection = false;
  $:cardInCollection(card).then((val) => (inCollection = val));
  $: if (card) {
    grade = Grade.parseGrade(card.grade ?? "");
  }
</script>

<CardCase
  id={1}
  class="hover:shadow-inner w-[300px] pt-4 truncate foggy"
  labelBG={`assets/revholo/${formatEnergy(card)}-rev.png`}
  title={card.name}
>
  <Energy type={formatEnergy(card)} slot="label1" class="h-8 ml-2" />

  <div slot="label3" class="flex flex-wrap flex-row w-16">
    {#each tags as tag}
      <div
        class="mask mask-squircle text-xs h-4 w-4 p-1 flex items-center justify-center col-block"
        style="background-color:{tag.color}"
      >
        <span>{tag.name.charAt(0).toUpperCase()}</span>
      </div>
    {/each}
  </div>

  <div slot="label4">
    {#if collection}
      {#if grade != null}
        <CardGradeStamp
          class="m-0 w-14 border-2 border-solid"
          grade={grade.grade}
          grader={grade.grader}
          modifier={grade.modifier}
        />
      {/if}
    {:else if edit}
      <button
        id={`add-card-button${alt}`}
        aria-label="Add Card to Collection"
        class={`btn btn-circle h-12 w-12 shadow-lg mt-2 mb-2`}
        on:click={(event) => dispatch("clickEdit", event)}
      >
        <Icon path={mdiPencil} class="w-6 h-6" />
      </button>
    {:else}
      <button
        id="{`add-card-button${alt}`}A"
        aria-label="Add Card to Collection"
        class="btn btn-circle h-12 w-12 shadow-lg mt-2 mb-2 indicator"
        on:click={(event) => dispatch("clickAdd", event)}
      >
        <!--In collection indicator-->
        {#if inCollection}
        <span class="indicator-item badge w-6 h-6 p-0 badge-success">
          <Icon path={mdiCheck} class="w-4 h-4"/>
        </span>
        {/if}
        <Icon path={mdiPlus} class="w-6 h-6" />
      </button>
    {/if}
  </div>
  <CardImage
    slot="image"
    class="rounded-md z-10 cursor-pointer"
    overlay={revFoil}
    overlay_mask={modern_path_rev}
    on:click={(event) => dispatch("clickImage", event)}
    cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
      card.expName
    )}/${encodeURI(card.cardId)}`}
    id={alt}
  />
  <img
    slot="footer1"
    class="w-6 h-6 ml-2 mb-2 object-contain"
    src={`${baseURL}/pokemon/expansion/symbol/${encodeURI(card.expName)}`}
    alt={card.expName}
  />
  <span slot="footer2">{formatPrice(card.price)}</span>
  <span slot="footer3">{card.expCardNumber}</span>
  <PokeRarity slot="footer4" class="w-6 h-6 mr-2 mb-1" rarity={card.rarity} />
</CardCase>

<style>
  .col-block {
    font-family: "Poppins", sans-serif;
    font-weight: bold;
  }
  /*Style to include that are removed erroneously from tree shaker*/
  .m-0 {}
  .border-2 {}
  .border-gray-600 {}
  .bg-yellow-600 {}
  .bg-slate-300 {}
  .bg-black {}
  .text-yellow-600 {}
</style>
