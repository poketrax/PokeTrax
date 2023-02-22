<script lang="ts">
	import { Energy } from 'tcg-case';
	import type { Writable } from 'svelte/store';

	let sort = '';
	let name = '';
	let set = '';
	let dex = '';
	let price = '';
	let date = '';

	let priceDirection = '';
	let dateDirection = '';

	let selected = 'btn-active';

	export let sortStore: Writable<string>;
	sortStore.subscribe((val) => (sort = val));
	export let executeSearch: () => void;

	function setSort(option) {
		switch (option) {
			case 'name':
				if (sort.includes('name')) {
					sortStore.set('');
					name = '';
					executeSearch();
				} else {
					sortStore.set('name');
					name = selected;
					dateDirection = '';
					priceDirection = '';
					set = '';
					dex = '';
					price = '';
					date = '';
					executeSearch();
				}
				break;
			case 'setNumber':
				if (sort.includes('setNumber')) {
					sortStore.set('');
					set = '';
					executeSearch();
				} else {
					sortStore.set('setNumber');
					dateDirection = '';
					priceDirection = '';
					name = '';
					set = selected;
					dex = '';
					price = '';
					date = '';
					executeSearch();
				}
				break;
			case 'pokedex':
				if (sort.includes('pokedex')) {
					sortStore.set('');
					dex = '';
					executeSearch();
				} else {
					sortStore.set('pokedex');
					dateDirection = '';
					priceDirection = '';
					name = '';
					set = '';
					dex = selected;
					price = '';
					date = '';
					executeSearch();
				}
				break;
			case 'price':
				if (sort.includes('priceDSC')) {
					sortStore.set('');
					priceDirection = '';
					price = '';
					executeSearch();
				} else if (sort.includes('priceASC')) {
					sortStore.set('priceDSC');
					priceDirection = '⬇︎';
					executeSearch();
				} else {
					sortStore.set('priceASC');
					priceDirection = '⬆︎';
					dateDirection = '';
					name = '';
					set = '';
					dex = '';
					price = selected;
					date = '';
					executeSearch();
				}
				break;
			case 'date':
				if (sort.includes('dateDSC')) {
					sortStore.set('');
					dateDirection = '';
					date = '';
					executeSearch();
				} else if (sort.includes('dateASC')) {
					sortStore.set('dateDSC');
					dateDirection = '⬇︎';
					executeSearch();
				} else {
					sortStore.set('dateASC');
					dateDirection = '⬆︎';
					priceDirection = '';
					name = '';
					set = '';
					dex = '';
					price = '';
					date = selected;
					executeSearch();
				}
				break;
		}
	}
</script>

<div class="btn-group">
	<button
		id="sort-name"
		class="btn {name}"
		on:click={() => {
			setSort('name');
		}}
	>
		Name
	</button>
	<button
		id="sort-set-number"
		class="btn {set}"
		on:click={() => {
			setSort('setNumber');
		}}
	>
		Set #
	</button>
	<button
		id="sort-dex"
		class="btn {dex}"
		on:click={() => {
			setSort('pokedex');
		}}
	>
		<Energy type="trainer" class="h-4 w-4" /> #
	</button>
	<button
		id="sort-price"
		class="btn {price}"
		on:click={() => {
			setSort('price');
		}}
	>
		$ {priceDirection}
	</button>
	<button
		id="sort-date"
		class="btn {date}"
		on:click={() => {
			setSort('date');
		}}
	>
		📅 {dateDirection}
	</button>
</div>
