<script lang="ts">
    import "@carbon/styles/css/styles.css";
    import "@carbon/charts/styles.css";
    import { Energy, CardImage } from "tcg-case";
    import { mdiClose } from "@mdi/js";
    import Icon from "../Shared/Icon.svelte";
    import { formatDate, baseURL } from "../../lib/Utils";
    import type { Card, Price } from "../../lib/Card";
    import { getCardPrices } from "../../lib/CardSearchStore";
    import { formatEnergy, formatPrice } from "../../lib/Utils";

    export let card: Card;
    export let show: boolean;

    let chartData: any[];
    let endDate = new Date(Date.now());
    let startDate = new Date(Date.now());
    startDate.setMonth(endDate.getMonth() - 3);

    async function updatePrice() {
        let prices = await getCardPrices(card);
        chartData = prices.map((val: Price) => {
            return {
                group: val.variant,
                key: new Date(val.date),
                value: val.price,
            };
        });
        console.log(chartData);
    }

    $: if (card) {
        updatePrice();
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
                <button
                    id={`close-card-dialog`}
                    aria-label="Close Card Dialgo"
                    class="btn btn-circle"
                    on:click={() => {
                        show = false;
                    }}
                >
                    <Icon path={mdiClose} class="w-6 h-6" />
                </button>
            </div>
            <div class="flex ml-3 items-center">
                <CardImage
                    width="330px"
                    height="460px"
                    class="rounded-md w-max"
                    cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
                        card.expName
                    )}/${encodeURI(card.cardId)}`}
                    id={1}
                />
                <div class="ml-2 overflow-x-scroll">
                    <table class="table table-compact h-fit ml-2 mb-2 w-[500px]">
                        <tr>
                            <td class="w-60">Name</td>
                            <td
                                ><input
                                    type="text"
                                    placeholder="name"
                                    bind:value={card.name}
                                    class="input input-bordered border-solid w-full max-w-xs"
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Expansion(expNam)</td>
                            <td
                                ><input
                                    type="text"
                                    placeholder="expName"
                                    bind:value={card.expName}
                                    class="input input-bordered border-solid w-full max-w-xs"
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Expansion Number(expCardNumber)</td>
                            <td
                                ><input
                                    type="text"
                                    placeholder="expCardNumber"
                                    bind:value={card.expCardNumber}
                                    class="input input-bordered border-solid w-full max-w-xs"
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Expansion TCGP Number(expIdTCGP)</td>
                            <td
                                ><input
                                    type="text"
                                    placeholder="expIdTCGP"
                                    bind:value={card.expIdTCGP}
                                    class="input input-bordered border-solid w-full max-w-xs"
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Expansion TCGP Code(expCodeTCGP)</td>
                            <td
                                ><input
                                    type="text"
                                    placeholder="expIdTCGP"
                                    bind:value={card.expCodeTCGP}
                                    class="input input-bordered border-solid w-full max-w-xs"
                                    disabled
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Rarity</td>
                            <td><input
                                type="text"
                                placeholder="rarity"
                                bind:value={card.rarity}
                                class="input input-bordered border-solid w-full max-w-xs"
                                disabled
                            /></td>
                        </tr>
                        <tr>
                            <td>Energy(energyType)</td>
                            <td><input
                                type="text"
                                placeholder="energyType"
                                bind:value={card.energyType}
                                class="input input-bordered border-solid w-full max-w-xs"
                                disabled
                            /></td>
                        </tr>
                        <tr>
                            <td>Realease Date(releaseDate)</td>
                            <td><input
                                type="text"
                                placeholder="releaseDate"
                                bind:value={card.releaseDate}
                                class="input input-bordered border-solid w-full max-w-xs"
                                disabled
                            /></td>
                        </tr>
                        <tr>
                            <td>TCGP ID (idTCGP)</td>
                            <td><input
                                type="text"
                                placeholder="idTCGP"
                                bind:value={card.idTCGP}
                                class="input input-bordered border-solid w-full max-w-xs"
                                disabled
                            /></td>
                        </tr>
                        <tr>
                            <td>Pokedex number (pokedex)</td>
                            <td><input
                                type="text"
                                placeholder="idTCGP"
                                bind:value={card.pokedex}
                                class="input input-bordered border-solid w-full max-w-xs"
                                disabled
                            /></td>
                        </tr>
                        <tr>
                            <td>Pokedex number (pokedex)</td>
                            <td><input
                                type="text"
                                placeholder="idTCGP"
                                bind:value={card}
                                class="input input-bordered border-solid w-full max-w-xs"
                                disabled
                            /></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </label>
</label>
