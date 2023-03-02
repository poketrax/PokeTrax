<script lang="ts">
	import { collectionView } from './../../lib/CollectionStore';
	import CollectionToggle from './CollectionToggle.svelte';
	let view = 'Cards';
	collectionView.subscribe((val) => (view = val));
</script>

{#if view === 'Products'}
	<CollectionToggle />
{/if}
