<script lang="ts">
    import "@carbon/styles/css/styles.css";
    import "@carbon/charts/styles.css";
    import { Energy, CardImageFancy } from "tcg-case";
    import { mdiClose } from "@mdi/js";
    import Icon from "../Shared/Icon.svelte";
    import { baseURL, formatEnergy, getHolo } from "../../lib/Utils";
    import type { Card } from "../../lib/Card";
    import type { Tag } from "../../lib/Collection";
    import {
        addCardCollection,
        tagOptionStore,
    } from "../../lib/CollectionStore";

    export let card: Card;
    export let show: boolean;
    export let selectedVariant: string;

    let selectedTags = new Array<string>();
    let tagOptions = new Array<Tag>();
    let grade = "";
    let paid = 0;
    let count = 1;

    tagOptionStore.subscribe((val) => (tagOptions = val));

    function onCheck(event) {
        if (event.target.checked) {
            selectedTags.push(event.target.id);
        } else {
            selectedTags.splice(selectedTags.indexOf(event.target.id), 1);
        }
    }

    function addCard() {
        card.variant = selectedVariant;
        card.tags = selectedTags;
        card.paid = paid;
        card.count = 1;
        card.grade = grade;
        addCardCollection(card, true);
        show = false;
    }
</script>

<input
    type="checkbox"
    id="dialog-coll-1"
    class="modal-toggle"
    bind:checked={show}
/>
<label for="dialog-coll-1" class="modal cursor-pointer">
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
                <span class="text-xl">Add {card.name} to Collection</span>
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
                <CardImageFancy
                    width="330px"
                    height="460px"
                    holoEffect={getHolo(card)}
                    cardImg={`${baseURL}/pokemon/card_img/${encodeURI(
                        card.expName
                    )}/${encodeURI(card.cardId)}`}
                    id={1}
                />
                <div class="ml-2 w-96 h-full flex flex-col">
                    <!-- GRADE -->
                    <div class="form-control mb-2">
                        <label class="input-group">
                            <span class="w-32">Grade</span>
                            <input
                                type="text"
                                id="grade-input"
                                placeholder="ex CGC-10-P, PSA-9"
                                bind:value={grade}
                                class="input input-bordered w-full"
                            />
                        </label>
                    </div>
                    <!-- PAID -->
                    <div class="form-control mb-2">
                        <label class="input-group">
                            <span class="w-32">Paid</span>
                            <input
                                type="number"
                                id="paid-input"
                                placeholder="100"
                                min=0
                                bind:value={paid}
                                class="input input-bordered w-full"
                            />
                        </label>
                    </div>
                    <!-- Count -->
                    <div class="form-control mb-2">
                        <label class="input-group">
                            <span class="w-32">Count</span>
                            <input
                                type="number"
                                min=1
                                id="count-input"
                                placeholder="100"
                                bind:value={count}
                                class="input input-bordered w-full"
                            />
                        </label>
                    </div>
                    <!-- Variant -->
                    <div class="h-12 rounded-md bg-[#BFC4CF] flex items-center">
                        <span class="pl-4">Variant</span>
                    </div>
                    <ul class="mt-3 mb-3">
                        {#each card.variants == null ? [] : card.variants as variant, i}
                            <li class="flex items-center p-1">
                                <input
                                    type="radio"
                                    class="radio"
                                    name="variant-select"
                                    bind:group={selectedVariant}
                                    value={variant}
                                />
                                <a class="pl-2">{variant}</a>
                            </li>
                        {/each}
                    </ul>
                    <!-- Tags -->
                    <div class="h-12 rounded-md bg-[#BFC4CF] flex items-center">
                        <span class="pl-4">Tags</span>
                    </div>
                    <ul class="mt-3 mb-3 overflow-y-auto h-36">
                        {#each tagOptions as option}
                            <div
                                class="flex flex-grow items-center border-gray-300 mt-1 mb-1"
                            >
                                <input
                                    type="checkbox"
                                    id={option.name}
                                    checked={selectedTags.includes(option.name)}
                                    class="checkbox border-solid ml-1 border-2 border-black"
                                    style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem"
                                    on:click={onCheck}
                                />
                                <div
                                    class="mask mask-hexagon-2 h-6 w-6 ml-2 mr-2"
                                    style="background-color: {option.color};"
                                />
                                <div class="">{option.name}</div>
                            </div>
                        {/each}
                    </ul>
                    <div class="flex-grow" />
                    
                </div>
            </div>
            <div class="flex">
                <div class="flex-grow" />
                <button
                    class="btn mr-2"
                    on:click={() => {
                        show = false;
                    }}>Cancel</button
                >
                <button class="btn" on:click={addCard}>Add</button>
            </div>
        </div>
    </label>
</label>
