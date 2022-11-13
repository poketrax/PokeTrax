<script lang="ts">
    import ProductTile from "../components/ProductSearch/ProductTile.svelte";
    import type { SealedProduct } from "../lib/SealedProduct";
    import ProductFilters from "../components/ProductSearch/ProductFilters.svelte";
    import ProductSort from "../components/ProductSearch/ProductSort.svelte";
    import {
        searchTermStore,
        executeProductSearch,
        sortStore,
        pageStore,
        productSearchResults,
    } from "../lib/ProductSearchStore";

    let products = new Array<SealedProduct>();
    productSearchResults.subscribe((val) => (products = val.products));
    executeProductSearch();
</script>

<div class="grid grid-cols-2 h-20">
    <div>
        <ProductFilters
            {searchTermStore}
            {pageStore}
            executeSearch={executeProductSearch}
        />
    </div>
    <div class="flex h-20 items-center">
        <div class="flex-grow" />
        <ProductSort {sortStore} executeSearch={executeProductSearch} />
        <div class="w-4" />
    </div>
</div>
<div class="h-[calc(100vh-10rem)] w-screen overflow-hidden">
    <div class="flex h-[calc(100vh-10rem)] w-screen overflow-auto">
        <div
            class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4"
            id="card-grid"
        >
            {#each products as product}
                <ProductTile {product} />
            {/each}
        </div>
    </div>
</div>
