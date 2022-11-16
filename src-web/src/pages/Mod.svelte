<script lang="ts">
    import type { Expansion } from "./../lib/CardMeta";
    import ModCardSearch from "./../components/Mod/ModCardSearch.svelte";
    import { baseURL } from "../lib/Utils";
    import { auth_exp } from "../lib/ModDataStore";
    import { Subscription, timer } from "rxjs";
    import Icon from "./../components/Shared/Icon.svelte";
    import { mdiGoogle } from "@mdi/js";
    import { executeCardSearch } from "../lib/ModDataStore";

    let login_state = "init";
    let sub: Subscription;

    let tabActive = "text-";

    let cardSearch = "tab-active";
    let setSearch = "";
    let seriesSearch = "";

    /**
     * Subscription to poll every 1sec to see if the use is logged in
     */
    auth_exp.subscribe((val) => {
        let now = Date.now() / 1000;
        if (val !== 0 && val > now) {
            login_state = "done";
            sub?.unsubscribe();
            executeCardSearch();
        }
    });

    /**
     * Polls server to see if oidc login is complete
     */
    function getExpire() {
        fetch(`${baseURL}/gcp/auth/exp`)
            .then((res) => res.json())
            .then((data) => auth_exp.set(data.exp));
    }

    /**
     * Initiates login porcess
     */
    function login() {
        login_state = "waiting";
        fetch(`${baseURL}/gcp/auth/login`);
        let loginTimer = timer(1000, 1000);
        sub = loginTimer.subscribe(() => {
            getExpire();
        });
    }

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
</script>

{#if login_state === "init"}
    <div class="flex items-center justify-center h-48">
        <button
            class="btn btn-primary text-black hover:text-white"
            on:click={login}
        >
            <Icon path={mdiGoogle} class="h-8 w-8 m-1" color="ghostwhite" />
            Login w/ Google
        </button>
    </div>
{:else if login_state === "waiting"}
    <div class="flex items-center justify-center h-48 ">
        <div class="flex flex-col items-center justify-center">
            <div>Login in on the browser window that opened</div>
            <progress class="progress w-56 mt-4 mb-4" />
            <button
                class="btn bg-slate-200 text-black hover:text-white"
                on:click={login}>Re-open Window</button
            >
        </div>
    </div>
{:else if login_state === "done"}
    <div class="navbar m-2 rounded-xl bg-base-300 w-[calc(100vw-1rem)]">
        <span class="text-lg ml-6"> Admin Console</span>
        <div class="flex-grow" />
        <div class="tabs tabs-boxed m-2">
            <span
                class="tab-lg w-40 text-center cursor-pointer {cardSearch}"
                on:click={() => tabClick("cards")}>Cards</span
            >
            <span
                class="tab-lg w-40 text-center cursor-pointer {setSearch}"
                on:click={() => tabClick("sets")}>Sets</span
            >
            <span
                class="tab-lg w-40 text-center cursor-pointer {seriesSearch}"
                on:click={() => tabClick("series")}>Series</span
            >
        </div>
        <div class="flex-grow" />
    </div>
    {#if cardSearch !== ""}
        <ModCardSearch />
    {:else if setSearch !== ""}{:else if seriesSearch !== ""}{/if}
{/if}
