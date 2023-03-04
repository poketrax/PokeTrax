<script lang="ts">
	import { Price } from 'tcg-case';
	import { formatPrice, getTextColorBgContrast } from './../../lib/Utils';
	import { addProductCollection, getTagFromCard } from '../../lib/CollectionStore';
	import type { SealedProduct } from '../../lib/SealedProduct';
	import StoreLink from '../Shared/StoreLink.svelte';
	import { createEventDispatcher } from 'svelte';
	import { mdiPlus, mdiTrashCan, mdiCheck, mdiCancel } from '@mdi/js';
	import Icon from '../Shared/Icon.svelte';
	import CountControl from '../Collection/CountControl.svelte';

	export let product: SealedProduct;
	let confirm = false;
	const dispatch = createEventDispatcher();

	$: total = product.count * product.price;

	function update() {
		addProductCollection(product, true);
	}
</script>

<div class="card card-side bg-base-100 shadow-xl h-72 foggy">
	<div class="flex rounded-l-xl bg-white items-center justify-center">
		<div class="m-2 w-48 h-48 lg:w-36 lg:h-36">
			<img
				class="object-contain h-48 w-48 lg:w-36 lg:h-36 cursor-pointer"
				src={`${product.img}`}
				alt={product.name}
				on:click={() => dispatch('click')}
				on:keypress={(e) => {
					if (e.key === 'enter') {
						dispatch('click');
					}
				}}
			/>
		</div>
	</div>
	<div class="card-body p-4">
		<div class="flex">
			<div
				class="card-title lg:text-lg cursor-pointer"
				on:click={() => dispatch('click')}
				on:keypress={(e) => {
					if (e.key === 'enter') {
						dispatch('click');
					}
				}}
			>
				{product.name}
			</div>
			<div class="flex-grow" />
			{#if product.count == null}
				<button class="btn btn-circle" on:click={() => dispatch('add')}>
					<Icon path={mdiPlus} class="w-6" />
				</button>
			{:else}
				<div class="btn-group">
					<button class="btn btn-square" on:click={() => (confirm = true)}>
						<Icon path={mdiTrashCan} class="w-6" />
					</button>
					{#if confirm}
						<button
							class="btn btn-square btn-success"
							on:click={() => {
								dispatch('delete');
								confirm = false;
							}}
						>
							<Icon path={mdiCheck} class="w-6" />
						</button>
						<button class="btn btn-square btn-error" on:click={() => (confirm = false)}>
							<Icon path={mdiCancel} class="w-6" />
						</button>
					{/if}
				</div>
			{/if}
		</div>
		{#if product.paid}
			<table class="table table-compact w-full">
				<tbody>
					<tr>
						<td>Price</td>
						<td>
							<Price price={product.price} paid={product.paid} />
						</td>
					</tr>
					<tr>
						<td>Paid</td>
						<td> {formatPrice(product.paid)}</td>
					</tr>
					{#if product.tags && product.tags.length !== 0}
						<tr>
							<td>Tags</td>
							<td>
								{#each getTagFromCard(product.tags) as tag}
									<span
										class="badge badge-ghost badge-sm"
										style="background-color: {tag.color}; color: {getTextColorBgContrast(
											tag.color
										)}">{tag.name}</span
									>
								{/each}
							</td>
						</tr>
					{:else}
						<tr>
							<td>Type</td>
							<td> {product.productType}</td>
						</tr>
					{/if}
					<tr>
						<td>Total Value</td>
						<td> {formatPrice(total)}</td>
					</tr>
				</tbody>
			</table>
		{:else}
			<p>{formatPrice(product.price)}</p>
		{/if}
		{#if product.count == null}
			<div class="card-actions justify-end">
				<StoreLink store="ebay" sealedProduct {product} />
				<StoreLink store="tcgp" sealedProduct {product} />
			</div>
		{:else}
			<div class="flex">
				<CountControl bind:count={product.count} on:change={update} />
			</div>
		{/if}
	</div>
</div>
