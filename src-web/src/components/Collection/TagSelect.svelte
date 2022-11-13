<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "../Shared/Icon.svelte";
    import { mdiMenuDown } from "@mdi/js";
    import type { Tag } from "../../lib/Collection";
    import { mdiPlus, mdiDelete } from "@mdi/js";
    import {
        tagOptionStore,
        selectedTagsStore,
        addTag,
        deleteTag,
    } from "../../lib/CollectionStore";
    import ColorPicker from "../Shared/ColorPicker.svelte";
    
    const dispatch = createEventDispatcher();
    let clazz = ""
    export { clazz as class };
    export let search = false;
    export let selected = new Array<string>();
    let newTagValue = "";
    let newTagColor = "";
    let options = new Array<Tag>();
    let showdialog = false;

    tagOptionStore.subscribe((val) => (options = val));
    selectedTagsStore.subscribe((val) => (selected = val));

    function onCheck(event) {
        if (event.target.checked) {
            selected.push(event.target.id);
            if(search)
                selectedTagsStore.set(selected);
            dispatch("change", event);
        } else {
            selected.splice(selected.indexOf(event.target.id), 1);
            if(search)
                selectedTagsStore.set(selected);
            dispatch("change", event);
        }
    }

    function onAdd() {
        if (newTagValue === "") return;
        addTag({ name: newTagValue, color: newTagColor });
    }

    function onDelete(value: string) {
        deleteTag({name: value, color: ""});
    }
</script>

<div class="input-group h-12 z-20 w-fit {clazz}">
    <span>Tags</span>
    <div class="input dropdown dropdown-end pl-0 pr-1">
        <span tabindex="0" class="h-12 bg-base-100">
            <Icon path={mdiMenuDown} class="h-6 w-6" />
        </span>
        <div
            tabindex="0"
            class="dropdown-content shadow bg-base-100 rounded-md w-80 max-h-72 h- pt-2 overflow-y-scroll"
        >
            {#each options as option}
                <div class="form-control ml-2 mr-2">
                    <div class="input-group items-center input-group-sm ">
                        <div
                            class="flex flex-grow items-center border-solid border border-gray-300"
                        >
                            <input
                                type="checkbox"
                                id={option.name}
                                checked={selected.includes(option.name)}
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
                        <button
                            class="btn btn-sm btn-square bg-error border-error"
                            on:click={() => onDelete(option.name)}
                        >
                            <Icon class="h-6 w-6" path={mdiDelete} />
                        </button>
                    </div>
                </div>
            {/each}
            <div class="h-2"/>
        </div>
    </div>
    <label for="new-tag" class="btn">
        <Icon class="h-6 w-6" path={mdiPlus} />
    </label>
</div>

<input
    type="checkbox"
    id="new-tag"
    class="modal-toggle"
    bind:value={showdialog}
/>
<div class="modal z-[200]">
    <div class="modal-box w-[19rem] h-96">
        <h3 class="font-bold text-lg mr-1">Create New Tag</h3>
        <div class="h-4" />
        <input
            type="text"
            bind:value={newTagValue}
            placeholder="Name"
            class="input input-bordered input-primary w-64"
        />
        <div class="h-4" />
        <ColorPicker bind:value={newTagColor} />
        <div class="modal-action">
            <label for="new-tag" class="btn">Cancel</label>
            <label for="new-tag" class="btn" on:click={onAdd}>ADD</label>
        </div>
    </div>
</div>
