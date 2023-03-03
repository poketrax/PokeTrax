<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { formatPrice } from './../../lib/Utils';

    export let valueStore: Writable<number>;
	let value = '-.--';
    valueStore.subscribe((val) =>  value = formatPrice(val))
</script>

<div>
	<span>Value:</span>
	<span>{value}</span>
</div>
