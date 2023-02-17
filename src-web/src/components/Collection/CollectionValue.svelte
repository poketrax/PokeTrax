<script lang="ts">
	import { collectionValue } from './../../lib/CollectionStore';
    import {formatPrice} from './../../lib/Utils';

    let value = "-.--";
    collectionValue.subscribe((val) => value = formatPrice(val));
</script>

<div>
    <span>Value:</span>
    <span>{value}</span>
</div>