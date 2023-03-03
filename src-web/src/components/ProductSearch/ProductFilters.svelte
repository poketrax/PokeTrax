<script lang="ts">
	import type { SelectOption } from './../Shared/AutoMultiSelect/SelectOption';
	import type { Writable } from 'svelte/store';
	import AutoMultiSelect from '../Shared/AutoMultiSelect/AutoMultiSelect.svelte';
	import { productTypesStore, typesSelected } from '../../lib/ProductSearchStore';
	//Search Terms
	export let searchTermStore: Writable<string>;
	let searchTerm = '';
	searchTermStore.subscribe((val) => (searchTerm = val));
	//Page store
	export let pageStore: Writable<number>;
	//Execute search function
	export let executeSearch: () => void;
	let typeOptions = [];
	productTypesStore.subscribe((val) => {
		typeOptions = val.map((i) => {
			return { value: i };
		});
	});

	function keywordSearch() {
		searchTermStore.set(searchTerm);
		pageStore.set(0);
		executeSearch();
	}
</script>

<div class="p-4 flex">
	<input
		type="text"
		placeholder="🔍 Search"
		class="input input-bordered w-96 "
		bind:value={searchTerm}
		on:input={keywordSearch}
	/>
	<div class="w-2" />
	<AutoMultiSelect
		class="dropdown-end"
		label="Types"
		options={typeOptions}
		dataStore={typesSelected}
    on:change={executeSearch}
	/>
</div>
<div class="p-4" />
