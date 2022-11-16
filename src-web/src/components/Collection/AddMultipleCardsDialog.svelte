<script lang="ts">
  import { addCardCollection } from "../../lib/CollectionStore";
  import { Card } from "../../lib/Card";
  import { baseURL } from "../../lib/Utils";
  import TagSelect from "./TagSelect.svelte";

  export let show = false;
  export let cards: Map<string, [string, Card]>;

  let selectedTags: string[] = [];
  let inProgress = false;
  let progress = 0;

  function addCards() {
    inProgress = true;
    for (let element of cards) {
      let card = element[1][1];
      let addCard = Card.collectionClone(
        card,
        element[1][0],
        1,
        0,
        "",
        selectedTags
      );
      addCardCollection(addCard, true);
      progress++;
    }
    inProgress = false;
    progress = 0;
  }
</script>

<!-- Put this part before </body> tag -->
<input
  type="checkbox"
  id="dialog-add-multi"
  bind:checked={show}
  class="modal-toggle"
/>
<div class="modal">
  <div class="modal-box w-11/12 max-w-5xl relative">
    <label
      for="dialog-add-multi"
      class="btn btn-sm btn-circle absolute right-2 top-2">✕</label
    >
    <h3 class="text-lg font-bold">Add Multiple Cards to Collection</h3>
    <div class="w-full flex">
      <div class="flex-grow" />
      <TagSelect bind:selected={selectedTags} />
    </div>
    <div
      class="py-4 px-2 grid gap-2 grid-cols-3 max-h-96 h-min overflow-y-auto"
    >
      {#each [...cards] as [name, variant]}
        <div class="card card-side bg-base-100 shadow-xl">
          <figure class="w-12 m-2">
            <img
              src={`${baseURL}/pokemon/card_img/${encodeURI(
                variant[1].expName
              )}/${encodeURI(variant[1].cardId)}`}
              alt="Movie"
            />
          </figure>
          <div class="card-body">
            <h2 class="card-title">{name}</h2>
            <div class="badge badge-md">{variant[0]}</div>
          </div>
        </div>
      {/each}
    </div>
    <progress
      class="progress w-56"
      value={progress}
      max={cards.size}
      hidden={!inProgress}
    />
    <div class="flex p-2">
      <div class="flex-grow" />
      <button on:click={() => (show = false)} class="btn">Cancel</button>
      <div class="w-2" />
      <button class="btn" on:click={addCards}>Add</button>
    </div>
  </div>
</div>
