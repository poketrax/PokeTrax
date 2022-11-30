<script lang="ts">
    import type { Tag } from "./../../lib/Collection";
    import {
        CardCase,
        Energy,
        CardImage,
        PokeRarity,
        CardGradeStamp,
    } from "tcg-case";
    import { Grade } from "../../lib/CardMeta";
    import { formatEnergy, formatPrice, baseURL } from "../../lib/Utils";
    import { createEventDispatcher } from "svelte";
    import Icon from "../Shared/Icon.svelte";
    import type { Card } from "../../lib/Card";
    import { mdiPlus, mdiPencil } from "@mdi/js";

    const dispatch = createEventDispatcher();

    export let card: Card;
    export let id: number;
    export let edit = false;
    export let collection = false;
    export let revFoil = "";
    export let tags = new Array<Tag>();

    let grade: Grade = null;

    $: if (card) {
        grade = Grade.parseGrade(card.grade ?? "");
    }
</script>

<CardCase
    {id}
    class="hover:shadow-inner w-[300px] pt-4 truncate"
    labelBG={`assets/revholo/${formatEnergy(card)}-rev.png`}
    title={card.name}
>
    <Energy type={formatEnergy(card)} slot="label1" class="h-8 ml-2" />

    <div slot="label3" class="flex flex-wrap flex-row w-16">
        {#each tags as tag}
            <div
                class="mask mask-squircle text-xs h-4 w-4 p-1 flex items-center justify-center col-block"
                style="background-color:{tag.color}"
            >
                <span>{tag.name.charAt(0).toUpperCase()}</span>
            </div>
        {/each}
    </div>

    <div slot="label4">
        {#if collection }
            {#if grade != null}
                <CardGradeStamp class="m-0 w-12" grade={grade.grade} grader={grade.grader} />
            {/if}
        {:else if edit}
            <button
                id={`add-card-button${id}`}
                aria-label="Add Card to Collection"
                class="btn btn-circle h-12 w-12 shadow-lg mt-2 mb-2"
                on:click={(event) => dispatch("clickEdit", event)}
            >
                <Icon path={mdiPencil} class="w-6 h-6" />
            </button>
        {:else}
            <button
                id="{`add-card-button${id}`}A"
                aria-label="Add Card to Collection"
                class="btn btn-circle h-12 w-12 shadow-lg mt-2 mb-2"
                on:click={(event) => dispatch("clickAdd", event)}
            >
                <Icon path={mdiPlus} class="w-6 h-6" />
            </button>
        {/if}
    </div>
    <CardImage
        slot="image"
        class="rounded-md z-10 cursor-pointer"
        overlay={revFoil}
        on:click={(event) => dispatch("clickImage", event)}
        cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
            card.expName
        )}/${encodeURI(card.cardId)}`}
        {id}
    />

    <img
        slot="footer1"
        class="w-6 h-6 ml-2 mb-2"
        src={`${baseURL}/pokemon/expansion/symbol/${encodeURI(card.expName)}`}
        alt={card.expName}
    />
    <span slot="footer2">{formatPrice(card.price)}</span>
    <span slot="footer3">{card.expCardNumber}</span>
    <PokeRarity slot="footer4" class="w-6 h-6 mr-2 mb-1" rarity={card.rarity} />
</CardCase>

<style>
    .col-block {
        font-family: "Poppins", sans-serif;
        font-weight: bold;
    }
</style>