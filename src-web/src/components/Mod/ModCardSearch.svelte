<script lang="ts">
    import CardListItem from "../CardSearch/CardListItem.svelte";
    import CardFilters from "../CardSearch/CardFilters.svelte";
    import CardDisplay from "../CardSearch/CardDisplay.svelte";
    import CardSort from "../CardSearch/CardSort.svelte";
    import PokeCase from "../CardSearch/PokeCase.svelte";
    import { CardSearchResults, Card } from "../../lib/Card";
    import CardEditDialog from "../Mod/CardEditDialog.svelte";
    import { writable } from "svelte/store";
    import {
        cardResultStore,
        cardSearchDisplay,
        searchTermStore,
        selectedRaritiesStore,
        selectedSetsStore,
        executeCardSearch,
        sortStore,
    } from "../../lib/AdminDataStore";

    //Search term
    let searchTerm = "";
    searchTermStore.subscribe((val) => (searchTerm = val));
    //Selected Rarities
    let selectedRarities = [];
    selectedRaritiesStore.subscribe((val) => (selectedRarities = val));
    //Selected Sets(Expansions)
    let selectedSets = [];
    selectedSetsStore.subscribe((val) => (selectedSets = val));
    //Display
    let display = "grid";
    cardSearchDisplay.subscribe((val) => (display = val));
    //Results
    let results: CardSearchResults = new CardSearchResults();
    cardResultStore.subscribe((val) => (results = val));

    let showCardDialog = false;
    let selectedCards = new Map<string, string>();
    let dialogCard = new Card("", 0, "", "", "", "", "");

    function openCardDialog(card: Card) {
        dialogCard = card;
        showCardDialog = true;
    }
</script>

<div class="grid sm:grid-cols-1 lg:grid-cols-2">
    <div class="flex w-full items-center m-2">
        <CardFilters
            selRareStore={selectedRaritiesStore}
            selSetsStore={selectedSetsStore}
            {searchTermStore}
            pageStore={writable(0)}
            executeSearch={executeCardSearch}
        />
    </div>
    <div class="flex items-center">
        <div class="sm:w-2 lg:flex-grow" />
        <CardDisplay displayStore={cardSearchDisplay} />
        <div class="w-4" />
        <CardSort {sortStore} executeSearch={executeCardSearch} />
        <div class="w-2" />
    </div>
</div>
<div class="flex h-[calc(100vh-16rem)] w-screen overflow-auto">
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
                        edit
                        on:clickEdit={() => openCardDialog(card)}
                    />
                {/each}
            </div>
        </div>
        <div class="flex-grow" />
    {:else}
        <table class="table w-full m-2">
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
<CardEditDialog bind:show={showCardDialog} card={dialogCard} />
