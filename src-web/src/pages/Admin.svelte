<script lang="ts">
    import Icon from "../components/Shared/Icon.svelte";
    import ModCardSearch from "../components/Mod/ModCardSearch.svelte";
    import ModSetSearch from "../components/Mod/ModSetSearch.svelte";
    import ModSeriesSearch from "../components/Mod/ModSeriesSearch.svelte";
    import {
        adminSettingStore,
        AdminSettings,
        updateDbPath,
    } from "../lib/AdminDataStore";
    import { mdiArrowRightThinCircleOutline } from "@mdi/js";
    
    let adminSettings = new AdminSettings();
    let cardSearch = "tab-active";
    let setSearch = "";
    let seriesSearch = "";
    let dbPath = "";

    adminSettingStore.subscribe((val) => {
        adminSettings = val;
        dbPath = val.path;
    });

    function tabClick(tab: string) {
        switch (tab) {
            case "cards":
                cardSearch = "tab-active";
                setSearch = "";
                seriesSearch = "";
                break;
            case "sets":
                cardSearch = "";
                setSearch = "tab-active";
                seriesSearch = "";
                break;
            case "series":
                cardSearch = "";
                setSearch = "";
                seriesSearch = "tab-active";
                break;
        }
    }

    function setDbPath() {
        updateDbPath(dbPath);
    }
</script>

<div class="navbar rounded-xl w-screen">
    <span class="text-lg ml-2"> Admin Console</span>
    <div class="flex-grow" />
    <div class="tabs">
        <button
            class="tab tab-bordered w-40 {cardSearch}"
            on:click={() => tabClick("cards")}>Cards</button
        >
        <button
            class="tab tab-bordered w-40 {setSearch}"
            on:click={() => tabClick("sets")}>Sets</button
        >
        <button
            class="tab tab-bordered w-40 {seriesSearch}"
            on:click={() => tabClick("series")}>Series</button
        >
    </div>
    <div class="flex-grow" />
    <div>
        <div class="form-control w-96">
            <div class="input-group">
                <input
                    type="text"
                    placeholder="Set DB Path"
                    class="input input-bordered w-full"
                    bind:value={dbPath}
                />
                <button class="btn btn-square" on:click={setDbPath}>
                    <Icon class="w-8" path={mdiArrowRightThinCircleOutline} />
                </button>
            </div>
        </div>
    </div>
</div>
{#if adminSettings.path == null || adminSettings.path === ""}
    <div class="flex items-center justify-center h-48">
        <div>File not set</div>
    </div>
{:else if cardSearch !== ""}
    <ModCardSearch />
{:else if setSearch !== ""}
    <ModSetSearch />
{:else if seriesSearch !== ""}
    <ModSeriesSearch />
{/if}
