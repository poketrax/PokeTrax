<script lang="ts">
  import { mdiPlus } from "@mdi/js";
  import { Card } from "../lib/Card";
  import CardDialog from "../components/CardSearch/CardDialog.svelte";
  import PokeCase from "../components/CardSearch/PokeCase.svelte";
  import Icon from "../components/Shared/Icon.svelte";
  import CardPagination from "../components/Shared/Pagination.svelte";
  import { CardSearchResults } from "../lib/Card";
  import CardSort from "../components/CardSearch/CardSort.svelte";
  import CardFilters from "../components/CardSearch/CardFilters.svelte";
  import {
    pageStore,
    cardResultStore,
    executeCardSearch,
    selectedRaritiesStore,
    selectedSetsStore,
    cardSearchDisplay,
    searchTermStore,
    sortStore,
  } from "../lib/CardSearchStore";
  import Disclaimer from "../components/Shared/Disclaimer.svelte";
  import CardDisplay from "../components/CardSearch/CardDisplay.svelte";
  import CardListItem from "../components/CardSearch/CardListItem.svelte";
  import AddSingleCardDialog from "../components/Collection/AddSingleCardDialog.svelte";
  import AddMultipleCardsDialog from "../components/Collection/AddMultipleCardsDialog.svelte";

  let results: CardSearchResults = new CardSearchResults();
  let showCardDialog = false;
  let showAddCardDialog = false;
  let showAddMultiCardDialog = false;
  let dialogCard = new Card("", 0, "", "", "", "", "");
  let display = "grid";
  let selectedCards = new Map<string, [string, Card]>();

  cardSearchDisplay.subscribe((val) => (display = val));
  cardResultStore.subscribe((val) => (results = val));

  function openCardDialog(card: Card) {
    dialogCard = card;
    showCardDialog = true;
  }

  function openAddSingleDialog(card: Card) {
    dialogCard = card;
    showAddCardDialog = true;
  }
</script>

<div class="grid sm:grid-cols-1 lg:grid-cols-2">
  <div class="p-2">
    <CardFilters
      selRareStore={selectedRaritiesStore}
      selSetsStore={selectedSetsStore}
      {searchTermStore}
      {pageStore}
      executeSearch={executeCardSearch}
    />
  </div>
  <div class="flex items-center">
    <div class="sm:w-2 lg:flex-grow" />
    {#if display === "list"}
      <button
        id={`mass-add-collection`}
        aria-label="Add Cards to Collection"
        class="btn btn-circle h-12 w-12 shadow-lg m-2"
        on:click={() => {
          showAddMultiCardDialog = true;
          selectedCards = selectedCards; //WHY?? svelte non-sense this is used to trigger redraw of dialog; //todo change to a store
        }}
      >
        <Icon path={mdiPlus} class="w-6 h-6" />
      </button>
    {/if}
    <CardDisplay displayStore={cardSearchDisplay} />
    <div class="w-2" />
    <CardSort {sortStore} executeSearch={executeCardSearch} />
    <div class="w-2" />
  </div>
</div>
<CardPagination
  {pageStore}
  executeSearch={executeCardSearch}
  resultStore={cardResultStore}
/>
<div class="h-[calc(100vh-14rem)] w-screen overflow-hidden">
  <div class="flex h-[calc(100vh-14rem)] w-screen overflow-auto">
    {#if display === "grid"}
      <div class="flex-grow" />
      <div>
        <div
          class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4"
          id="card-grid"
        >
          {#each results.cards as card, i}
            <PokeCase
              {card}
              id={i}
              on:clickImage={() => openCardDialog(card)}
              on:clickAdd={() => openAddSingleDialog(card)}
            />
          {/each}
        </div>
      </div>
      <div class="flex-grow" />
    {:else}
      <table class="table w-full ml-4 mr-2">
        <thead>
          <tr>
            <th>Select</th>
            <th class="text-center">Image</th>
            <th>Energy</th>
            <th>Card Name</th>
            <th>Variants</th>
            <th>Release Date</th>
            <th>Price</th>
            <th class="text-center">Details</th>
          </tr>
        </thead>
        <tbody>
          {#each results.cards as card, i}
            <CardListItem
              {card}
              id={i}
              selectedGroup={selectedCards}
              on:click={() => openCardDialog(card)}
            />
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
<CardDialog bind:show={showCardDialog} card={dialogCard} />
<AddSingleCardDialog
  bind:show={showAddCardDialog}
  selectedVariant={dialogCard.variants != null ? dialogCard.variants[0] : ""}
  card={dialogCard}
/>
<AddMultipleCardsDialog
  bind:show={showAddMultiCardDialog}
  bind:cards={selectedCards}
/>
<Disclaimer />
