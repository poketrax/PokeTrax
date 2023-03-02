<script lang="ts">
	import { collectionView } from './../lib/CollectionStore';
	import CardCollection from '../components/Collection/CardCollection.svelte';
	import ProdcutCollection from '../components/Collection/ProdcutCollection.svelte';
	let view = 'Cards';
	collectionView.subscribe((val) => (view = val));
</script>

{#if view === 'Cards'}
	<CardCollection />
{:else}
	<ProdcutCollection />
{/if}
