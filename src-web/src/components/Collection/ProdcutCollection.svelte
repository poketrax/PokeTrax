<script lang="ts">
	import { SealedProduct } from '../../lib/SealedProduct';
	import ProductTile from '../ProductSearch/ProductTile.svelte';
	import {
		collectionView,
		executeProductSearch,
		selectedTagsStore,
		productSearchTermStore,
		productResultStore,
		removeProdcutCollection
	} from './../../lib/CollectionStore';
	import AddProductDialog from './AddProductDialog.svelte';
	import CollectionToggle from './CollectionToggle.svelte';
	import TagSelect from './TagSelect.svelte';

	let view = 'Cards';
	let products = new Array<SealedProduct>();
	let searchTerm = '';
	let selectedProduct = new SealedProduct('', '', '');
	let showEditDialog = false;

	collectionView.subscribe((val) => (view = val));
	productResultStore.subscribe((prods) => {
		products = prods.products;
	});

	function openDialog(product: SealedProduct) {
		console.log(`open ${product.name}`);
		selectedProduct = product;
		showEditDialog = true;
	}

	function keywordSearch() {
		productSearchTermStore.set(searchTerm);
		executeProductSearch();
	}

	function deleteProd(product: SealedProduct) {
		removeProdcutCollection(product);
	}

	executeProductSearch();
</script>

{#if view === 'Products'}
	<AddProductDialog product={selectedProduct} bind:show={showEditDialog} edit={true} />
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
			<div class="grid h-fit grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2 m-2">
				{#each products as product}
					<ProductTile
						{product}
						on:delete={() => deleteProd(product)}
						on:edit={() => openDialog(product)}
					/>
				{/each}
			</div>
			<div class="flex-grow" />
		</div>
	</div>
{/if}
