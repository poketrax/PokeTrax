<script lang="ts">
	import { collectionView, executeProductSearch, selectedTagsStore } from './../../lib/CollectionStore';
	import CollectionToggle from './CollectionToggle.svelte';
	import TagSelect from './TagSelect.svelte';
	let view = 'Cards';
	let searchTerm = '';
	collectionView.subscribe((val) => (view = val));

	function keywordSearch() {}
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
		<div class="flex h-[calc(100vh-8rem)] w-screen overflow-auto" />
	</div>
{/if}
