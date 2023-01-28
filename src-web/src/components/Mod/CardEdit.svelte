<script lang="ts">
    import "@carbon/styles/css/styles.css";
    import "@carbon/charts/styles.css";
    import { Energy, CardImage } from "tcg-case";
    import { mdiClose } from "@mdi/js";
    import Icon from "../Shared/Icon.svelte";
    import { formatDate, baseURL } from "../../lib/Utils";
    import type { Card, Price } from "../../lib/Card";
    import { getCardPrices } from "../../lib/CardSearchStore";
    import { formatEnergy } from "../../lib/Utils";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let card: Card;

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

    function getGitHubImage(): string {
        return encodeURI(
            `https://raw.githubusercontent.com/poketrax/pokedata/main/images/cards` +
                `/${card.expName.replaceAll(" ", "-")}` +
                `/${card.cardId}.jpg`
        );
    }

    $: if (card) {
        updatePrice();
    }
</script>

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
            dispatch("close");
        }}
    >
        <Icon path={mdiClose} class="w-6 h-6" />
    </button>
</div>
<div class="h-[calc(100vh-14rem)] w-screen overflow-hidden">
    <div class="flex h-[calc(100vh-14rem)] w-screen overflow-auto">
        <div class="flex ml-3 w-screen">
            <div>
                <h2 class="text-lg">Local Image</h2>
                <div class="divider"/>
                <CardImage
                    width="165px"
                    height="230px"
                    class="rounded-md w-max"
                    cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
                        card.expName
                    )}/${encodeURI(card.cardId)}`}
                    id={1}
                />
                <a href={getGitHubImage()}>Git Hib Image </a>
            </div>
            <div class="flex-grow"/>
            <div class="ml-2">
                <table class="table table-compact ml-2 mb-2">
                    <tr>
                        <td class="w-60">Card ID</td>
                        <td
                            ><input
                                type="text"
                                placeholder="cardId"
                                bind:value={card.cardId}
                                class="input input-bordered border-solid w-[450px]"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td class="w-60">Name</td>
                        <td
                            ><input
                                type="text"
                                placeholder="name"
                                bind:value={card.name}
                                class="input input-bordered border-solid w-[450px]"
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
                                class="input input-bordered border-solid w-[450px]"
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
                                class="input input-bordered border-solid w-[450px]"
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
                                class="input input-bordered border-solid w-[450px]"
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
                                class="input input-bordered border-solid w-[450px]"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Rarity</td>
                        <td
                            ><input
                                type="text"
                                placeholder="rarity"
                                bind:value={card.rarity}
                                class="input input-bordered border-solid w-[450px]"
                            /></td
                        >
                    </tr>
                    <tr>
                        <td>Energy(energyType)</td>
                        <td
                            ><input
                                type="text"
                                placeholder="energyType"
                                bind:value={card.energyType}
                                class="input input-bordered border-solid w-[450px]"
                            /></td
                        >
                    </tr>
                    <tr>
                        <td>Realease Date(releaseDate)</td>
                        <td
                            ><input
                                type="text"
                                placeholder="releaseDate"
                                bind:value={card.releaseDate}
                                class="input input-bordered border-solid w-[450px]"
                            /></td
                        >
                    </tr>
                    <tr>
                        <td>TCGP ID (idTCGP)</td>
                        <td
                            ><input
                                type="text"
                                placeholder="idTCGP"
                                bind:value={card.idTCGP}
                                class="input input-bordered border-solid w-[450px]"
                            /></td
                        >
                    </tr>
                    <tr>
                        <td>Pokedex number (pokedex)</td>
                        <td
                            ><input
                                type="text"
                                placeholder="Pokedex"
                                bind:value={card.pokedex}
                                class="input input-bordered border-solid w-[450px]"
                            /></td
                        >
                    </tr>
                    <tr>
                        <td>Card Variants</td>
                        <td
                            ><input
                                type="text"
                                placeholder="Variants"
                                bind:value={card.variants}
                                class="input input-bordered border-solid w-[450px]"
                            /></td
                        >
                    </tr>
                </table>
            </div>
        </div>
    </div>
</div>