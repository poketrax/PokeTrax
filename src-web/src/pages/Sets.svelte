<script lang="ts">
    import { seriesStore, setStore } from "../lib/CardSearchStore";
    import type { Expansion, Series } from "../lib/CardMeta";
    import ExpansionButton from "../components/Sets/ExpansionButton.svelte";
    import {formatDate} from "../lib/Utils";

    let sets: Array<Expansion> = new Array();
    let seriesList: Array<Series> = new Array();
    setStore.subscribe((value) => (sets = value));
    seriesStore.subscribe((value) => (seriesList = value));
</script>

<div class="h-[calc(100vh-4rem)] overflow-hidden">
    <div class="h-[calc(100vh-4rem)] overflow-auto overflow-x-hidden">
        {#each seriesList as series}
            <div class="flex items-center justify-center h-12 w-screen bg-blue-800 ">
                <span class="m-4 text-white">{series.name}</span>
                <div class="grow"/>
                <spam class="mr-6 text-white">{formatDate(series.releaseDate)}</spam>
            </div>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4 m-4">
                {#each sets.filter((val) => val.series === series.name) as set}
                    <ExpansionButton name={set.name} />
                {/each}
            </div>
        {/each}
    </div>
</div>
