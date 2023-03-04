<script lang="ts">
	import { mdiClose } from '@mdi/js';
	import Icon from '../Shared/Icon.svelte';
	import { formatPrice } from '../../lib/Utils';
	import StoreLink from '../Shared/StoreLink.svelte';
	import type { SealedProduct } from '../../lib/SealedProduct';
    import type { Tag } from './../../lib/Tag';
	import { addProductCollection, tagOptionStore } from '../../lib/CollectionStore';

	export let product: SealedProduct;
	export let show: boolean;
	let tagOptions = new Array<Tag>();

	let selectedTags = new Array<string>();
	let paid = 0;
	let count = 1;

	tagOptionStore.subscribe((val) => (tagOptions = val));

	function addProduct() {
        product.count = count;
        product.paid = paid;
        product.tags = selectedTags;
        addProductCollection(product);
    }

	function onCheck(event) {
		if (event.target.checked) {
			selectedTags.push(event.target.id);
		} else {
			selectedTags.splice(selectedTags.indexOf(event.target.id), 1);
		}
	}
</script>

<input type="checkbox" id="dialog" class="modal-toggle" bind:checked={show}/>
<label for="dialog" class="modal cursor-pointer">
	<label class="modal-box relative w-fit max-w-5xl overflow-hidden" for="">
		<div>
			<div
				class="flex items-center m-2 p-3 bg-repeat"
				style={`background-image: url(\"assets/revholo/trainer-rev.png\")`}
			>
				<span class="text-xl">{product.name}</span>
				<div class="grow" />
				<button
					id={`close-card-dialog`}
					aria-label="Close Card Dialog"
					class="btn rounded-full"
					on:click={() => {
						show = false;
					}}
				>
					<Icon path={mdiClose} class="w-4 h-4" />
				</button>
			</div>
			<div class="flex justify-center items-center">
				<div>
					<img class="object-contain h-96 w-96" src={`${product.img}`} alt={product.name} />
				</div>
				<div class="flex flex-col ml-2">
					<div class="flex">
						<div class="grow" />
						<span>Market Price: {formatPrice(product.price)}</span>
						<div class="w-2" />
					</div>
					<!-- PAID -->
					<div class="form-control mb-2">
						<label class="input-group">
							<span class="w-32">Paid</span>
							<input
								type="number"
								id="paid-input"
								placeholder="100"
								min="0"
								bind:value={paid}
								class="input input-bordered w-full"
							/>
						</label>
					</div>
					<!-- Count -->
					<div class="form-control mb-2">
						<label class="input-group">
							<span class="w-32">Count</span>
							<input
								type="number"
								min="1"
								id="count-input"
								placeholder="100"
								bind:value={count}
								class="input input-bordered w-full"
							/>
						</label>
					</div>
					<!-- Tags -->
					<div class="h-12 rounded-md bg-[#BFC4CF] flex items-center">
						<span class="pl-4">Tags</span>
					</div>
					<ul class="mt-3 mb-3 overflow-y-auto h-36">
						{#each tagOptions as option}
							<div class="flex flex-grow items-center border-gray-300 mt-1 mb-1">
								<input
									type="checkbox"
									id={option.name}
									checked={selectedTags.includes(option.name)}
									class="checkbox border-solid ml-1 border-2 border-black"
									style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem"
									on:click={onCheck}
								/>
								<div
									class="mask mask-hexagon-2 h-6 w-6 ml-2 mr-2"
									style="background-color: {option.color};"
								/>
								<div class="">{option.name}</div>
							</div>
						{/each}
					</ul>
				</div>
			</div>

			<div class="flex h-12">
				<StoreLink {product} store="tcgp" />
				<StoreLink {product} store="ebay" />
				<div class="flex-grow" />
				<button
					class="btn mr-2"
					on:click={() => {
						show = false;
					}}>Cancel</button
				>
				<button class="btn" on:click={addProduct}>Add</button>
			</div>
		</div>
	</label>
</label>
