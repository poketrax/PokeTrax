<script lang="ts">
	import Icon from '../Shared/Icon.svelte';
	import { mdiCards, mdiPackage } from '@mdi/js';
	import { collectionView } from './../../lib/CollectionStore';
	let type = 'Cards';

	collectionView.subscribe((val) => {
		type = val;
	});

	function setView(view: string) {
		collectionView.set(view);
	}
</script>

<div class="btn-group">
	<button
		id="view-cards"
		class="btn  {type === 'Cards' ? 'btn-primary' : ''}"
		on:click={() => setView('Cards')}
	>
		<Icon path={mdiCards} class="w-6"/>
	</button>
	<button
		id="view-products"
		class="btn {type === 'Products' ? 'btn-primary' : ''}"
		on:click={() => setView('Products')}
	>
		<Icon path={mdiPackage} class="w-6"/>
	</button>
</div>
