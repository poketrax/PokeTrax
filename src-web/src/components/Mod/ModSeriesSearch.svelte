<script lang="ts">
  import { baseURL } from "./../../lib/Utils.js";
  import type { Series } from "../../lib/CardMeta";
  import { seriesStore } from "../../lib/AdminDataStore";
  import Icon from "../Shared/Icon.svelte";
  import { mdiPencil } from "@mdi/js";

  let series_list = new Array<Series>();
  seriesStore.subscribe((val) => (series_list = val));
</script>

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
              <button class="btn btn-circle">
                <Icon path={mdiPencil} class="w-6" />
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
