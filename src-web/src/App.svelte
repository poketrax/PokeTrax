<script lang="ts">
  import TitleBar from "./components/Shared/TitleBar.svelte";
  import { settingStore } from "./lib/SettingStore";
  import { page } from "./lib/Utils";
  import Mod from "./pages/Admin.svelte";
  import CardSearch from "./pages/CardSearch.svelte";
  import Collections from "./pages/Collections.svelte";
  import Loading from "./pages/Loading.svelte";
  import SealedProductSearch from "./pages/SealedProductSearch.svelte";
  import Sets from "./pages/Sets.svelte";
  import Settings from "./pages/Settings.svelte";

  let pageVal: string;
  page.subscribe((value) => (pageVal = value));

  let bgImage = ""
  settingStore.subscribe((val) => bgImage = val.bg_img)
</script>

<div class="poketrax" style="background-image: url({bgImage})">
  <TitleBar />
  {#if pageVal === "loading"}
    <Loading />
  {/if}

  {#if pageVal === "cards"}
    <CardSearch />
  {/if}

  {#if pageVal === "sets"}
    <Sets />
  {/if}

  {#if pageVal === "sealedProducts"}
    <SealedProductSearch />
  {/if}

  {#if pageVal === "collections"}
    <Collections />
  {/if}

  {#if pageVal === "admin"}
    <Mod />
  {/if}

  {#if pageVal === "settings"}
  <Settings />
{/if}
</div>

<style lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  @import url("https://fonts.googleapis.com/css2?family=Poppins&family=Ubuntu:wght@500&display=swap");
  .primary-text {
    color: #2196f3 !important;
  }

  .poketrax {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }

  :global(.foggy){
    background-color: rgba(255, 255, 255, 0.7);
  }
</style>
