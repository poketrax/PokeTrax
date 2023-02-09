<script lang="ts">
	import { Settings, settingStore } from './../../lib/SettingStore';
  import logo from "../../assets/poketrax.png";
  import { page } from "../../lib/Utils";
  import { mdiCog } from "@mdi/js";
  import Icon from "./Icon.svelte";

  let admin = false;
  settingStore.subscribe((val) => (admin = val.admin));
</script>

<div class="sticky top-0 w-full h-16 bg-gray-400 flex flex-row">
  <div class="h-16 flex-none flex flex-row w-full">
    <img class="h-16 w-16 p-1" src={logo} alt="logo" />
    <span class="font-sans text-3xl pt-3 pl-2"> PokéTrax </span>
    <span class="pl-6 flex w-full">
      <button
        id="cards-page"
        class="hover:text-blue-700"
        on:click={() => page.set("cards")}
      >
        Cards
      </button>
      <div class="w-6" />
      <button
        id="sets-page"
        class="hover:text-blue-700"
        on:click={() => {
          page.set("sets");
        }}
      >
        Sets
      </button>
      <div class="w-6" />
      <button
        id="sealed-page"
        class="hover:text-blue-700"
        on:click={() => {
          page.set("sealedProducts");
        }}
      >
        Sealed Products
      </button>
      <div class="w-6" />
      <button
        id="collection-page"
        class="hover:text-blue-700"
        on:click={() => {
          page.set("collections");
        }}
      >
        Collection
      </button>
      <div class="w-6" />
      {#if admin}
        <button
          id="collection-page"
          class="hover:text-blue-700"
          on:click={() => {
            page.set("admin");
          }}
        >
          Admin
        </button>
      {/if}
      <div class="flex-grow" />
      <button
        class="btn btn-circle btn-ghost mt-2 mr-2"
        on:click={() => {
          page.set("settings");
        }}
      >
        <Icon path={mdiCog} class="w-6 h-6" />
      </button>
    </span>
  </div>
</div>
