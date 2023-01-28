<script lang="ts">
    import CountControl from "./../Collection/CountControl.svelte";
    import "@carbon/styles/css/styles.css";
    import "@carbon/charts/styles.css";
    import { Energy, CardImageFancy, CardImage } from "tcg-case";
    import { LineChart } from "@carbon/charts-svelte";
    import { ScaleTypes } from "@carbon/charts/interfaces";
    import { mdiClose, mdiContentSave } from "@mdi/js";
    import Icon from "../Shared/Icon.svelte";
    import { formatDate, baseURL } from "../../lib/Utils";
    import type { Card, Price } from "../../lib/Card";
    import { getCardPrices } from "../../lib/CardSearchStore";
    import {
        formatEnergy,
        formatPrice,
        getHolo,
        formatExpansionNumber,
        modern_path_rev
    } from "../../lib/Utils";
    import StoreLink from "../Shared/StoreLink.svelte";
    import DeleteButton from "../Collection/DeleteButton.svelte";
    import {
        removeCardCollection,
        addCardCollection,
    } from "../../lib/CollectionStore";
    import TagSelect from "../Collection/TagSelect.svelte";

    export let card: Card;
    export let show: boolean;
    export let collection: boolean = false;

    let save = false;
    let chartData: any[];
    let expNum: string = "";

    $: holoPattern = getHolo(card);

    $: getCardPrices(card).then((val) => {
        chartData = val.map((val: Price) => {
            return {
                group: val.variant,
                key: new Date(val.date),
                value: val.price,
            };
        });
    });

    $: formatExpansionNumber(card.expCardNumber, card.expName).then(
        (val) => (expNum = val)
    );

    function confirmDelete() {
        removeCardCollection(card);
        show = false;
    }

    function saveCard() {
        addCardCollection(card);
        save = false;
    }

</script>

<input type="checkbox" id="dialog" class="modal-toggle" bind:checked={show} />
<label for="dialog" class="modal cursor-pointer">
    <label class="modal-box relative w-fit max-w-5xl overflow-hidden" for="">
        <div>
            <div
                class="flex items-center m-2 p-3 bg-repeat"
                style={`background-image: url(\"assets/revholo/${formatEnergy(
                    card
                )}-rev.png\")`}
            >
                <Energy type={formatEnergy(card)} class="h-8 w-8" />
                <div class="w-2" />
                <span class="text-xl">{card.name}</span>
                <div class="grow" />
                {#if collection}
                    <TagSelect
                        selected={card.tags}
                        on:change={saveCard}
                        class="mr-2"
                    />
                    <DeleteButton on:confirm={confirmDelete} />
                    {#if save}
                        <button class="btn btn-circle btn-primary mr-1" on:click={saveCard}>
                            <Icon class="h-5" path={mdiContentSave} />
                        </button>
                    {/if}
                {/if}
                <button
                    id={`close-card-dialog`}
                    aria-label="Close Card Dialog"
                    class="btn rounded-full"
                    on:click={() => {
                        show = false;
                    }}
                >
                    <Icon path={mdiClose} class="w-4 h-4" />
                </button>
            </div>
            <div class="flex">
                <div>
                    <div class="h-8" />
                    {#if collection}
                        <CountControl
                            bind:count={card.count}
                            on:change={saveCard}
                            class="w-[330px] mb-2"
                        />
                    {/if}
                    {#if card.variant?.includes("Reverse")}
                        <CardImage
                            width="330px"
                            height="460px"
                            overlay={`assets/revholo/${formatEnergy(
                                card
                            )}-rev.png`}
                            overlay_mask={modern_path_rev}
                            cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
                                card.expName
                            )}/${encodeURI(card.cardId)}`}
                            id={1}
                        />
                    {:else}
                        <CardImageFancy
                            width="330px"
                            height="460px"
                            holoEffect={holoPattern}
                            cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
                                card.expName
                            )}/${encodeURI(card.cardId)}`}
                            id={1}
                        />
                    {/if}
                </div>

                <div class="ml-2">
                    <div class="flex">
                        <div class="grow" />
                        <span>Market Price: {formatPrice(card.price)}</span>
                        <div class="w-2" />
                    </div>
                    <div class="flex">
                        <LineChart
                            data={chartData}
                            options={{
                                title: "Prices",
                                height: "350px",
                                width: "500px",
                                axes: {
                                    bottom: {
                                        title: "Date",
                                        mapsTo: "key",
                                        scaleType: ScaleTypes.TIME,
                                    },
                                    left: {
                                        title: "Price",
                                        mapsTo: "value",
                                        scaleType: ScaleTypes.LINEAR,
                                    },
                                },
                            }}
                        />
                    </div>
                    <div
                        class="h-[250px] ml-2 mb-2 w-[500px] overflow-x-auto overflow-y-auto"
                    >
                        <table class="table table-zebra table-compact w-full">
                            <tr>
                                <td>Name</td>
                                <td>{card.name}</td>
                            </tr>
                            {#if card.variant != null}
                                <tr>
                                    <td>Variant</td>
                                    <td>{card.variant}</td>
                                </tr>
                            {/if}
                            {#if collection}
                                <tr>
                                    <td>Grade</td>
                                    <td
                                        ><input
                                            type="text"
                                            placeholder="Grade"
                                            bind:value={card.grade}
                                            class="input input-bordered input-xs w-full max-w-xs"
                                            on:input={() => (save = true)}
                                        />
                                    </td>
                                </tr>
                            {/if}
                            {#if collection}
                                <tr>
                                    <td>Paid</td>
                                    <td
                                        ><input
                                            type="number"
                                            placeholder="Paid"
                                            bind:value={card.paid}
                                            class="input input-bordered input-xs w-full max-w-xs"
                                            on:input={() => (save = true)}
                                        />
                                    </td>
                                </tr>
                            {/if}

                            <tr>
                                <td>Expansion</td>
                                <td>{card.expName}</td>
                            </tr>
                            <tr>
                                <td>Expansion Number</td>
                                <td>{expNum}</td>
                            </tr>
                            <tr>
                                <td>Rarity</td>
                                <td>{card.rarity}</td>
                            </tr>
                            <tr>
                                <td>Realease Date</td>
                                <td>{formatDate(card.releaseDate)}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="h-12">
                <StoreLink product={card} store="tcgp" />
                <StoreLink product={card} store="ebay" />
            </div>
        </div>
    </label>
</label>
<!-- Importing styles that are missed with tree-shaking -->
<style>
    .text-green-600{}
    .text-red-600{}
</style>