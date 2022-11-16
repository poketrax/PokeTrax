<script lang="ts">
    import TitleBar from "./components/Shared/TitleBar.svelte";
    import { page } from "./lib/Utils";
    import Mod from "./pages/Mod.svelte";
    import CardSearch from "./pages/CardSearch.svelte";
    import Collections from "./pages/Collections.svelte";
    import Loading from "./pages/Loading.svelte";
    import SealedProductSearch from "./pages/SealedProductSearch.svelte";
    import Sets from "./pages/Sets.svelte";

    let pageVal: string;
    page.subscribe((value) => (pageVal = value));
</script>

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

<style lang="postcss">
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    @import url('https://fonts.googleapis.com/css2?family=Poppins&family=Ubuntu:wght@500&display=swap');
    .primary-text {
        color: #2196f3 !important;
    }
</style>
