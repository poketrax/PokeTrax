<script lang="ts">
  import type { Series } from "./../../lib/CardMeta.js";
  import { createEventDispatcher } from "svelte";
  import {
    mdiArrowLeft,
    mdiFloppy,
    mdiTrashCan,
    mdiCheck,
    mdiCancel,
  } from "@mdi/js";
  import Icon from "../Shared/Icon.svelte";
  import PokeBallSpinner from "../Shared/PokeBallSpinner.svelte";
  import { baseURL } from "./../../lib/Utils.js";
  import {
    deleteSeries,
    upsertSeries,
  } from "../../lib/AdminDataStore.js";
  import BasicToast from "../Shared/BasicToast.svelte";

  const dispatch = createEventDispatcher();

  export let series: Series;
  let add = series.name !== "NEW_SERIES";
  let showConfirmSave = false;
  let showConfirmDelete = false;
  let saveInProgress = false;
  let successToast;
  let errorToast;
  let date = series.releaseDate.slice(0, 10);

  function save() {
    showConfirmSave = false;
    saveInProgress = true;
    upsertSeries(series)
      .then((_) => {
        successToast.show();
        saveInProgress = false;
      })
      .catch((_) => {
        errorToast.show();
        saveInProgress = false;
      });
  }

  function del() {
    showConfirmDelete = false;
    deleteSeries(series)
      .then((_) => {
        successToast.show();
      })
      .catch((_) => {
        errorToast.show();
      });
  }

  function setDate() {
    series.releaseDate = new Date(date).toISOString();
  }
</script>

<BasicToast message="Success!" type="alert-success" bind:this={successToast} />
<BasicToast message="Failed!" type="alert-error" bind:this={errorToast} />
<!--EDIT FORM-->
<div class="h-[calc(100vh-8rem)] w-screen overflow-hidden">
  <div class=" h-[calc(100vh-8rem)] w-screen overflow-auto">
    <div class="m-2">
      <div class="bg-gray-200 flex items-center w-full">
        <!--Back-->
        <button on:click={() => dispatch("close")} class="btn btn-square">
          <Icon path={mdiArrowLeft} class="w-6 h-6" />
        </button>
        <spam class="flex-grow" />
        <span class="ml-4">{series.name}</span>
        <spam class="flex-grow" />
        <!--Save-->
        {#if saveInProgress}
          <PokeBallSpinner />
        {:else}
          <div class="btn-group">
            <button
              on:click={() => (showConfirmSave = true)}
              class="btn btn-square"
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
        {/if}
        <div class="w-1" />
        <!--Delete-->
        <div class="btn-group">
          <button
            on:click={() => (showConfirmDelete = true)}
            class="btn btn-square"
          >
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
      </div>
      <div class="flex w-full">
        <div class="ml-3">
          <div class="divider" />
          <h2 class="text-lg">Logo Image</h2>
          <div class="divider" />
          <img
            class="h-40 w-80 m-1 object-contain"
            src="{baseURL}/pokemon/expansion/logo/{encodeURIComponent(
              series.name
            )}"
            alt={series.name}
          />
        </div>
        <div class="flex-grow" />
        <div class="ml-2">
          <table class="table table-compact ml-2 mb-2">
            <tr>
              <td class="w-60">Name</td>
              <td
                ><input
                  type="text"
                  placeholder="Name"
                  disabled={add}
                  bind:value={series.name}
                  class="input input-bordered border-solid w-[450px]"
                />
              </td>
            </tr>
            <tr>
              <td class="w-60">Release Date</td>
              <td
                ><input
                  type="date"
                  bind:value={date}
                  on:change={setDate}
                  class="input input-bordered border-solid w-[450px]"
                />
              </td>
            </tr>

            <tr>
              <td class="w-60">Icon URL</td>
              <td
                ><input
                  type="url"
                  placeholder="Logo URL"
                  bind:value={series.icon}
                  class="input input-bordered border-solid w-[450px]"
                />
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
