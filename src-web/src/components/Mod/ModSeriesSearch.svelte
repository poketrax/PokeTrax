<script lang="ts">
  import { baseURL } from "./../../lib/Utils.js";
  import { Series } from "../../lib/CardMeta";
  import { seriesStore } from "../../lib/AdminDataStore";
  import Icon from "../Shared/Icon.svelte";
  import SeriesEdit from "./SeriesEdit.svelte";
  import { mdiPencil, mdiPlus } from "@mdi/js";

  let series_list = new Array<Series>();
  seriesStore.subscribe((val) => (series_list = val));
  let selectedSeries: Series | undefined = null;
</script>

{#if selectedSeries == null}
  <div class="flex mx-2">
    <div class="flex-grow" />
    <button
      class="btn"
      on:click={() => {
        selectedSeries = new Series("NEW_SERIES", new Date().toISOString());
      }}
    >
      <Icon class="w-6" path={mdiPlus} />
      Series
    </button>
  </div>
  <div class="h-[calc(100vh-9rem)] w-screen overflow-hidden">
    <div class="flex h-[calc(100vh-9rem)] w-screen overflow-auto">
      <table class="table table-compact w-full m-2">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Release Data</th>
            <th>Icon URL</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {#each series_list as series}
            <tr>
              <td>
                <img
                  class="h-6 w-12 m-1 object-contain"
                  src="{baseURL}/pokemon/expansion/logo/{encodeURIComponent(
                    series.name
                  )}"
                  alt={series.name}
                />
              </td>
              <td>{series.name}</td>
              <td>{series.releaseDate}</td>
              <td>{series.icon}</td>
              <td>
                <button
                  class="btn btn-circle"
                  on:click={() => {
                    selectedSeries = series;
                  }}
                >
                  <Icon path={mdiPencil} class="w-6" />
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{:else}
  <SeriesEdit
    series={selectedSeries}
    on:close={() => (selectedSeries = null)}
  />
{/if}
