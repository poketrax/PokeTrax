<script lang="ts">
	import { collectionView } from './../../lib/CollectionStore';
	import CollectionToggle from './CollectionToggle.svelte';
	let view = 'Cards';
	collectionView.subscribe((val) => (view = val));
</script>

{#if view === 'Products'}
	<CollectionToggle />
	<div class="lg:h-[calc(100vh-12rem)] sm:h-[calc(100vh-17rem)]  w-screen overflow-hidden">
		<div class="flex lg:h-[calc(100vh-12rem)] sm:h-[calc(100vh-17rem)] w-screen overflow-auto" />
	</div>
{/if}
