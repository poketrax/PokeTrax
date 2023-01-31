<script lang="ts">
  import { Energy, CardImage } from "tcg-case";
  import {
    mdiArrowLeft,
    mdiCheck,
    mdiCancel,
    mdiTrashCan,
    mdiFloppy,
  } from "@mdi/js";
  import Icon from "../Shared/Icon.svelte";
  import { baseURL } from "../../lib/Utils";
  import type { Card } from "../../lib/Card";
  import { rarityStore, setStore } from "../../lib/CardSearchStore";
  import { formatEnergy } from "../../lib/Utils";
  import { createEventDispatcher } from "svelte";
  import { writable } from "svelte/store";
  import BasicToast from "../Shared/BasicToast.svelte";
  import MultiSelect from "../Shared/MultiSelect.svelte";
  import {
    deleteCard,
    upsertCard,
    variantOptions,
  } from "../../lib/AdminDataStore";

  const dispatch = createEventDispatcher();
  export let cards: string[];

  let successToast;
  let errorToast;
  let showConfirmDelete = false;
  let showConfirmSave = false;

  let rarirtyOptions = new Array<string>();
  let variantOptionsForm = variantOptions.map((val) => {
    return { name: val };
  });
  let expOptions = new Array<string>();
  setStore.subscribe((val) => (expOptions = val.map((exp) => exp.name)));
  rarityStore.subscribe((val) => (rarirtyOptions = val));

  let date = new Date().toDateString();
  let expantion = "";
  let expIdTCGP = 0;
  let rarity = "";
  let energy = "";

  let selectedVariants = writable(Array<string>());
  selectedVariants.set([]);

  function save() {
    /*
        upsertCard(card)
            .then((_) => {
                successToast.show();
                showConfirmSave = false;
            })
            .catch((_) => {
                errorToast.show();
                showConfirmSave = false;
            });*/
  }

  function del() {
    /*
        deleteCard(card)
        .then((_) => {
                successToast.show();
                showConfirmSave = false;
            })
            .catch((_) => {
                errorToast.show();
                showConfirmSave = false;
            });*/
  }
</script>

<BasicToast message="Success!" type="alert-success" bind:this={successToast} />
<BasicToast message="Failed!" type="alert-error" bind:this={errorToast} />
<div
  class="flex items-center m-2 p-3 bg-repeat"
  style={`background-image: url(\"assets/revholo/trainer-rev.png\")`}
>
  <button
    id={`close-card-dialog`}
    aria-label="Close Card Dialog"
    class="btn btn-square"
    on:click={() => {
      dispatch("close");
    }}
  >
    <Icon path={mdiArrowLeft} class="w-6 h-6" />
  </button>

  <div class="grow" />
  <div class="w-2" />
  <span class="text-xl">Bulk Card Change</span>
  <div class="grow" />
  <!--Save-->
  <div class="btn-group">
    <button
      id={`close-card-dialog`}
      aria-label="Close Card Dialog"
      class="btn btn-square"
      on:click={() => (showConfirmSave = true)}
    >
      <Icon path={mdiFloppy} class="w-6 h-6" />
    </button>
    {#if showConfirmSave}
      <button on:click={save} class="btn btn-square btn-success">
        <Icon path={mdiCheck} class="w-6 h-6" />
      </button>
      <button
        on:click={() => (showConfirmSave = false)}
        class="btn btn-square btn-error"
      >
        <Icon path={mdiCancel} class="w-6 h-6" />
      </button>
    {/if}
  </div>
  <div class="w-1" />
  <!--Delete-->
  <div class="btn-group">
    <button on:click={() => (showConfirmDelete = true)} class="btn btn-square">
      <Icon path={mdiTrashCan} class="w-6 h-6" />
    </button>
    {#if showConfirmDelete}
      <button on:click={del} class="btn btn-square btn-success">
        <Icon path={mdiCheck} class="w-6 h-6" />
      </button>
      <button
        on:click={() => (showConfirmDelete = false)}
        class="btn btn-square btn-error"
      >
        <Icon path={mdiCancel} class="w-6 h-6" />
      </button>
    {/if}
  </div>
  <div class="w-1" />
</div>
<!--Card Form-->
<div class="h-[calc(100vh-14rem)] w-screen overflow-hidden">
  <div class="flex  h-[calc(100vh-14rem)] w-screen overflow-auto">
    <div class="flex ml-3 w-screen">
      <div>
        <ul>
          {#each cards as card}
            <li>{card}</li>
          {/each}
        </ul>
      </div>
      <div class="flex-grow" />
      <div class="ml-2">
        <table class="table table-compact ml-2 mb-2">
          <tr>
            <td>Expansion (expNam)</td>
            <td>
              <select class="select w-full max-w-xs" bind:value={expantion}>
                {#each expOptions as option}
                  <option>{option}</option>
                {/each}
              </select>
            </td>
          </tr>
          <tr>
            <td>Expansion TCGP Number (expIdTCGP)</td>
            <td
              ><input
                type="text"
                placeholder="expIdTCGP"
                bind:value={expIdTCGP}
                class="input input-bordered border-solid w-[450px]"
              />
            </td>
          </tr>
          <tr>
            <td>Expansion TCGP Code (expCodeTCGP)</td>
            <td
              ><input
                type="text"
                placeholder="expIdTCGP"
                bind:value={expIdTCGP}
                class="input input-bordered border-solid w-[450px]"
              />
            </td>
          </tr>
          <tr>
            <td>Rarity</td>
            <td>
              <select class="select w-full max-w-xs" bind:value={rarity}>
                {#each rarirtyOptions as option}
                  <option>{option}</option>
                {/each}
              </select>
            </td>
          </tr>
          <tr>
            <td>Energy (energyType)</td>
            <td
              ><input
                type="text"
                placeholder="energyType"
                bind:value={energy}
                class="input input-bordered border-solid w-[450px]"
              /></td
            >
          </tr>
          <tr>
            <td>Realease Date (releaseDate)</td>
            <td
              ><input
                type="date"
                bind:value={date}
                class="input input-bordered border-solid w-[450px]"
              /></td
            >
          </tr>
          <tr>
            <td>Card Variants</td>
            <td>
              <MultiSelect
                label="Variants"
                options={variantOptionsForm}
                dataStore={selectedVariants}
              />
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</div>
