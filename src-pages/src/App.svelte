<script lang="ts">
	import Metrics from './Metrics.svelte';
  import { page } from "./lib/store";
  import Title from "./lib/Title.svelte";
  import Main from "./Main.svelte";
  import Install from "./Install.svelte";

  let pageValue: string;

  page.subscribe(value => {
    pageValue = value
  })
</script>

<Title />

{#if pageValue === "main"}
  <Main/>
{/if}

{#if pageValue === "install"}
  <Install/>
{/if}

{#if pageValue === "metrics"}
  <Metrics/>
{/if}

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
