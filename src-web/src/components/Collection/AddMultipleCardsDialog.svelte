<script lang="ts">
    export let show = false;
    export let cards : Map<string,string>; 
    $: keys = Array.from(cards.keys());
</script>

<!-- Put this part before </body> tag -->
<input type="checkbox" id="my-modal-3" bind:checked={show} class="modal-toggle" />
<div class="modal">
  <div class="modal-box relative">
    <label for="my-modal-3" class="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
    <h3 class="text-lg font-bold">Add Multiple Cards to Collection</h3>
    <ul class="py-4">
        {#each keys as cardId }
            <li>
                <span>{cardId}</span>
                <div class="badge badge-md">{cards.get(cardId)}</div>
            </li>
        {/each}
    </ul>
  </div>
</div>