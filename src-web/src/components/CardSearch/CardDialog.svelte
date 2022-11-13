<script lang="ts">
    import CountControl from "./../Collection/CountControl.svelte";
    import "@carbon/styles/css/styles.css";
    import "@carbon/charts/styles.css";
    import { Energy, CardImageFancy, CardImage } from "tcg-case";
    import { LineChart } from "@carbon/charts-svelte";
    import { ScaleTypes } from "@carbon/charts/interfaces";
    import { mdiClose } from "@mdi/js";
    import Icon from "../Shared/Icon.svelte";
    import { formatDate, baseURL } from "../../lib/Utils";
    import type { Card, Price } from "../../lib/Card";
    import { getCardPrices } from "../../lib/CardSearchStore";
    import {
        formatEnergy,
        formatPrice,
        getHolo,
        formatExpansionNumber,
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

    let holoPattern = "basic";
    let chartData: any[];
    let tags: string[];
    let expNum: string;

    async function updatePrice() {
        let prices = await getCardPrices(card);
        chartData = prices.map((val: Price) => {
            return {
                group: val.variant,
                key: new Date(val.date),
                value: val.price,
            };
        });
    }

    $: if (card) {
        tags = card.tags;
        updatePrice();
        formatExpansionNumber(card.expCardNumber, card.expName).then(
            (val) => (expNum = val)
        );
        holoPattern = getHolo(card);
    }

    function confirmDelete() {
        removeCardCollection(card);
        show = false;
    }

    function updateTags() {
        card.tags = tags;
        addCardCollection(card);
    }

    function updateCount() {
        addCardCollection(card);
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
                        selected={tags}
                        on:change={updateTags}
                        class="mr-2"
                    />
                    <DeleteButton on:confirm={confirmDelete} />
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
                    <div class = "h-8"/>
                    {#if collection}
                        <CountControl
                            bind:count={card.count}
                            on:change={updateCount}
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
                            {#if card.grade != null}
                                <tr>
                                    <td>Grade</td>
                                    <td
                                        ><input
                                            type="text"
                                            placeholder="Grade"
                                            value={card.grade}
                                            class="input input-bordered input-xs w-full max-w-xs"
                                        />
                                    </td>
                                </tr>
                            {/if}
                            {#if card.paid != null}
                                <tr>
                                    <td>Paid</td>
                                    <td
                                        ><input
                                            type="text"
                                            placeholder="Grade"
                                            value={card.paid}
                                            class="input input-bordered input-xs w-full max-w-xs"
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
