<script lang="ts">
    import type { Writable } from "svelte/store";
    import Icon from "./Icon.svelte";
    import {
        mdiPageFirst,
        mdiChevronLeft,
        mdiChevronRight,
        mdiPageLast,
    } from "@mdi/js";
    import type { PaginatedResults } from "src/lib/Utils";

    let total = 0;
    let rowsPerPage = 25;
    let currentPage = 0;
    let start = 0;
    let end = 0;
    let lastPage = 0;

    export let pageStore: Writable<number>;
    export let resultStore: Writable<PaginatedResults>;
    export let executeSearch: () => void;

    pageStore.subscribe((val) => {
        currentPage = val;
        start = currentPage * rowsPerPage;
        if (lastPage !== 0 && currentPage > lastPage) {
            currentPage = lastPage;
        }
    });

    resultStore.subscribe((val) => {
        total = val.count;
        end = Math.min(start + rowsPerPage, total);
        lastPage = Math.max(Math.ceil(total / rowsPerPage) - 1, 0);
        if (lastPage !== 0 && currentPage > lastPage) {
            currentPage = lastPage;
        }
    });
</script>

<div class="flex items-center">
    <div class="flex-grow" />
    <div class="pr-2">
        {start + 1}-{end} of {total}
    </div>
    <button
        class="btn btn-ghost"
        aria-label="First Page"
        on:click={() => {
            pageStore.set(0);
            executeSearch()
        }}
        disabled={currentPage === 0}
    >
        <Icon path={mdiPageFirst} class="h-6 w-6"/>
    </button>
    <button
        class="btn btn-ghost"
        aria-label="Previous Page"
        on:click={() => {
            pageStore.set(--currentPage);
            executeSearch()
        }}
        disabled={currentPage === 0}
    >
        <Icon path={mdiChevronLeft} class="h-6 w-6"/>
    </button>
    <button
        class="btn btn-ghost"
        aria-label="Next page"
        on:click={() => {
            pageStore.set(++currentPage);
            executeSearch()
        }}
        disabled={currentPage === lastPage}
    >
        <Icon path={mdiChevronRight} class="h-6 w-6"/>
    </button>
    <button
        class="btn btn-ghost"
        aria-label="Last page"
        on:click={() => {
            pageStore.set(lastPage);
            executeSearch()
        }}
        disabled={currentPage === lastPage}
    >
        <Icon path={mdiPageLast} class="h-6 w-6"/>
    </button>
</div>
