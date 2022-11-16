<script>
    export let value = "#AAD5FB";
    import { mdiCheck } from "@mdi/js";
    import Icon from "./Icon.svelte";
    // Our color set
    let values = [
        [
            "#DAAFE9",
            "#AAD5FB",
            "#ADE5DA",
            "#B0EDC3",
            "#FDF0A4",
            "#F8D6A2",
            "#FFB3B3"
        ],
        [
            "#C47ADA",
            "#75BAFA",
            "#72D5BF",
            "#73DE8C",
            "#FBE66E",
            "#F5B969",
            "#FF6666"
        ],
        [
            "#AE44B7",
            "#5E7ABD",
            "#4DACA9",
            "#63B75A",
            "#EDBD4A",
            "#EC9740",
            "#FF3333"
        ],
        [
            "#501B87",
            "#0C2794",
            "#337277",
            "#2F6A52",
            "#AE802F",
            "#AD6127",
            "#CC0000"
        ],
    ];
</script>

<div class="grid grid-cols-7 gap-1 w-64">
    {#each values as val, index}
        {#each val as innerValue, innerIndex}
            <button
                id="{index}-{innerIndex}"
                class:active={innerValue == value}
                style="background: {innerValue};"
                class="btn btn-square btn-sm"
                on:click={() => (value = innerValue)}
            >
                {#if innerValue === value}
                    <Icon path={mdiCheck} color={index > 1 ? "white" : "black"} />
                {/if}
            </button>
        {/each}
    {/each}
</div>

<style>
    .values-dropdown-grid {
        grid-template-columns: repeat(7, 24px);
        grid-gap: 10px;
        display: grid;
    }

    .color-block {
        border-radius: 0.2rem;
        width: 24px;
        height: 24px;
        line-height: 0;
        font-size: 0;
    }
</style>
