<script lang="ts">
    import { mdiPlus } from "@mdi/js";
    import Icon from "../components/Shared/Icon.svelte";
    import CardDisplay from "./../components/CardSearch/CardDisplay.svelte";
    import CardFilters from "./../components/CardSearch/CardFilters.svelte";
    import CardPagination from "../components/Shared/Pagination.svelte";
    import CardListItem from "./../components/CardSearch/CardListItem.svelte";
    import CardDialog from "../components/CardSearch/CardDialog.svelte";
    import CardSort from "../components/CardSearch/CardSort.svelte";
    import TagSelect from "../components/Collection/TagSelect.svelte";
    import { Card, CardSearchResults } from "../lib/Card";
    import PokeCase from "../components/CardSearch/PokeCase.svelte";
    import { getTagFromCard } from "../lib/CollectionStore";
    import { formatEnergy } from "../lib/Utils";
    import {
        pageStore,
        cardResultStore,
        executeCardSearch,
        selectedRaritiesStore,
        selectedSetsStore,
        cardSearchDisplay,
        searchTermStore,
        sortStore,
    } from "../lib/CollectionStore";

    let results: CardSearchResults = new CardSearchResults();
    let selectedCards = new Map<string, string>();
    let display = "grid";
    let showCardDialog = false;
    let dialogCard = new Card("", 0, "", "", "", "", "");

    cardSearchDisplay.subscribe((val) => (display = val));
    cardResultStore.subscribe((val) => (results = val));

    function openCardDialog(card: Card) {
        dialogCard = card;
        showCardDialog = true;
    }
</script>

<div class="grid sm:grid-cols-1 lg:grid-cols-2 lg:h-20 sm:h-40">
    <div class="flex items-center pl-2 pr-2">
        <CardFilters
            selRareStore={selectedRaritiesStore}
            selSetsStore={selectedSetsStore}
            {searchTermStore}
            {pageStore}
            executeSearch={executeCardSearch}
        />
        <TagSelect class="ml-2" search on:change={executeCardSearch} />
    </div>
    <div class="flex h-20 items-center">
        <div class="sm:w-2 lg:flex-grow" />
        {#if display === "list" && selectedCards.size == 0}
            <button
                id={`mass-add-collection`}
                aria-label="Add Cards to Collection"
                class="btn btn-circle h-12 w-12 shadow-lg m-2"
            >
                <Icon path={mdiPlus} class="w-6 h-6" />
            </button>
        {/if}
        <CardDisplay displayStore={cardSearchDisplay} />
        <div class="w-1" />
        <CardSort {sortStore} executeSearch={executeCardSearch} />
        <div class="w-2" />
    </div>
</div>
<CardPagination
    {pageStore}
    executeSearch={executeCardSearch}
    resultStore={cardResultStore}
/>
<div class="lg:h-[calc(100vh-12rem)] sm:h-[calc(100vh-17rem)]  w-screen overflow-hidden">
    <div class="flex lg:h-[calc(100vh-12rem)] sm:h-[calc(100vh-17rem)] w-screen overflow-auto">
        {#if display === "grid"}
            <div class="flex-grow" />
            <div>
                <div
                    class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4"
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
                        />
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>
<CardDialog bind:show={showCardDialog} card={dialogCard} collection />
