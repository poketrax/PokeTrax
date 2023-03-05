<script lang="ts">
  import CardDisplay from "../CardSearch/CardDisplay.svelte";
  import CardFilters from "../CardSearch/CardFilters.svelte";
  import CardPagination from "../Shared/Pagination.svelte";
  import CardDialog from "../CardSearch/CardDialog.svelte";
  import CardSort from "../CardSearch/CardSort.svelte";
  import TagSelect from "./TagSelect.svelte";
  import { Card, CardSearchResults } from "../../lib/Card";
  import PokeCase from "../CardSearch/PokeCase.svelte";
  import { getTagFromCard } from "../../lib/CollectionStore";
  import { formatEnergy } from "../../lib/Utils";
  import {
    cardPageStore,
    cardResultStore,
    executeCardSearch,
    selectedRaritiesStore,
    selectedSetsStore,
    selectedTagsStore,
    cardSearchDisplay,
    cardSearchTermStore,
    cardSortStore,
    cardCollectionValue
  } from "../../lib/CollectionStore";
  import CollectionListItem from "./CollectionListItem.svelte";
  import CollectionValue from "./CollectionValue.svelte";
	import CollectionToggle from "./CollectionToggle.svelte";

  let results: CardSearchResults = new CardSearchResults();
  let display = "grid";
  let showCardDialog = false;
  let dialogCard = new Card("", 0, "", "", "", "", "");
  dialogCard.tags = new Array<string>(); //set to avoid null pointer

  cardSearchDisplay.subscribe((val) => (display = val));
  cardResultStore.subscribe((val) => (results = val));

  function openCardDialog(card: Card) {
    dialogCard = card;
    showCardDialog = true;
  }

  function getRevHolo(card: Card): string {
    if (card.variant === "Reverse Holofoil") {
      return `assets/revholo/${formatEnergy(card)}-rev.png`;
    } else {
      return "";
    }
  }
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 w-screen foggy">
  <div class="flex items-center p-2">
    <CardFilters
      selRareStore={selectedRaritiesStore}
      selSetsStore={selectedSetsStore}
      searchTermStore= {cardSearchTermStore}
      pageStore={cardPageStore}
      executeSearch={executeCardSearch}
    />
    <TagSelect
      class="ml-2"
      search
      on:change={executeCardSearch}
      selectedTagsStore={selectedTagsStore}/>
  </div>
  <div class="flex items-center">
    <div class="sm:w-2 xl:flex-grow" />
    <CollectionToggle/>
    <div class="w-2" />
    <CardDisplay displayStore={cardSearchDisplay} />
    <div class="w-2" />
    <CardSort sortStore={cardSortStore} executeSearch={executeCardSearch} />
    <div class="w-2" />
  </div>
</div>

<CardPagination
  class="foggy"
  pageStore={cardPageStore}
  executeSearch={executeCardSearch}
  resultStore={cardResultStore}
><CollectionValue valueStore={cardCollectionValue} slot="extra"/>
</CardPagination>
<div
  class="xl:h-[calc(100vh-11rem)] sm:h-[calc(100vh-14rem)] w-screen overflow-hidden"
> 
  <div
    class="flex xl:h-[calc(100vh-11rem)] sm:h-[calc(100vh-14rem)] w-screen overflow-auto"
  >
    {#if display === "grid"}
      <div class="flex-grow" />
      <div>
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4"
          id="card-grid"
        >
          {#each results.cards as card, i}
            <PokeCase
              collection
              {card}
              revFoil={card.variant?.includes("Reverse")
                ? `assets/revholo/${formatEnergy(card)}-rev.png`
                : ""}
              on:clickImage={() => openCardDialog(card)}
              tags={getTagFromCard(card.tags)}
              id={i}
            />
          {/each}
        </div>
      </div>
      <div class="flex-grow" />
    {:else}
      <table class="table w-full ml-4 mr-2">
        <thead>
          <tr>
            <th class="text-center">Image</th>
            <th>Energy</th>
            <th>Card Name</th>
            <th>Tags</th>
            <th>Count</th>
            <th>Release Date</th>
            <th>value</th>
            <th class="text-center">Details</th>
          </tr>
        </thead>
        <tbody>
          {#each results.cards as card, i}
            <CollectionListItem
              {card}
              id={i}
              revFoil={getRevHolo(card)}
              on:click={() => openCardDialog(card)}
            />
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
{#if showCardDialog}
  <CardDialog bind:show={showCardDialog} card={dialogCard} collection />
{/if}