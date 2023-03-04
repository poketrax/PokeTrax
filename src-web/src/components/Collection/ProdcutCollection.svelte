<script lang="ts">
	import type { SealedProduct } from 'src/lib/SealedProduct';
	import ProductTile from '../ProductSearch/ProductTile.svelte';
	import {
		collectionView,
		executeProductSearch,
		selectedTagsStore,
		productSearchTermStore,
		productResultStore
	} from './../../lib/CollectionStore';
	import CollectionToggle from './CollectionToggle.svelte';
	import TagSelect from './TagSelect.svelte';
	let view = 'Cards';
	let products = new Array<SealedProduct>();
	let searchTerm = '';
	collectionView.subscribe((val) => (view = val));
	productResultStore.subscribe((prods) => {
		products = prods.products;
	});

	function keywordSearch() {
		productSearchTermStore.set(searchTerm);
		executeProductSearch();
	}

	executeProductSearch();
</script>

{#if view === 'Products'}
	<div class="flex p-2 foggy">
		<input
			id="search"
			type="text"
			placeholder="Search"
			class="input input-bordered rounded-sm flex-grow max-w-x"
			autocomplete="off"
			bind:value={searchTerm}
			on:input={keywordSearch}
		/>
		<div class="w-2" />
		<CollectionToggle />
		<TagSelect class="ml-2" search on:change={executeProductSearch} {selectedTagsStore} />
	</div>
	<div class="h-[calc(100vh-8rem)] w-screen overflow-hidden">
		<div class="flex h-[calc(100vh-8rem)] w-screen overflow-auto">
			<div class="flex-grow" />
			<div class="grid grid-cols-2 gap-2 m-2">
				{#each products as product}
					<ProductTile {product} />
				{/each}
			</div> 
			<div class="flex-grow" />
		</div>
	</div>
{/if}
