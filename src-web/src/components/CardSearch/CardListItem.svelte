<script lang="ts">
  import type { Card } from "../../lib/Card";
  import { Energy, CardImage } from "tcg-case";
  import { baseURL } from "../../lib/Utils";
  import {
    formatEnergy,
    formatPrice,
    formatDate,
    formatExpansionNumber,
  } from "../../lib/Utils";
  import { createEventDispatcher } from "svelte";
  import CardDetails from "../Shared/CardDetails.svelte";

  const dispatch = createEventDispatcher();

  export let card: Card;
  export let id: number;
  export let selectedGroup: Map<string, [string, Card]>;
  let expNumber = "";

  $: checked = selectedGroup.has(card.name);
  $: variant =
    selectedGroup.get(card.name) == null ? "" : selectedGroup.get(card.name)[0];

  $: formatExpansionNumber(card.expCardNumber, card.expName).then(
    (val) => (expNumber = val)
  );

  function checkClick() {
    if (checked) {
      selectedGroup.delete(card.name);
    } else {
      if (variant == null || variant === "") {
        variant = card.variants != null ? card.variants[0] : "";
      }
      selectedGroup.set(card.name, [variant, card]);
    }
  }

  function variantClick(_var) {
    selectedGroup.set(card.name, [_var, card]);
    variant = _var;
  }

  function onClick(event) {
    dispatch("click", event);
  }
</script>

<tr id="card-list-item-{id}">
  <th>
    <label>
      <input
        type="checkbox"
        class="checkbox border-solid ml-4 border-2 border-black"
        bind:checked
        on:click={checkClick}
      />
    </label>
  </th>
  <td>
    <CardImage
      height="96px"
      width="65px"
      class="rounded-md m-2 object-contain"
      on:click={onClick}
      cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
        card.expName
      )}/${encodeURI(card.cardId)}`}
      {id}
    />
  </td>
  <td>
    <Energy class="mr-2 h-8 w-8" type={formatEnergy(card)} />
  </td>
  <td>
    <span class="text-2xl w-72">{card.name}</span>
    <br />
    <span class="badge badge-ghost badge-sm">{card.cardType}</span>
  </td>
  <td>
    <form class="w-48">
      {#each card.variants as _var, i}
        <div class="form-control bg-gray-300 rounded-xl mb-1">
          <label class="label cursor-pointer">
            <input
              type="radio"
              name="{card.name}-radio"
              class="radio border-2 border-solid border-black"
              bind:group={variant}
              on:click={() => variantClick(_var)}
              value={_var}
            />
            <span class="label-text pr-2">{_var}</span>
          </label>
        </div>
      {/each}
    </form>
  </td>
  <td>
    {formatDate(card.releaseDate)}
  </td>
  <td>
    {formatPrice(card.price)}
  </td>
  <th>
    <CardDetails {card} />
  </th>
</tr>
