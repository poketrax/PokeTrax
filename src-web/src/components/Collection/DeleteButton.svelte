<script>
    import Icon from "./../Shared/Icon.svelte";
    import { mdiDelete } from "@mdi/js";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
</script>

<div class="dropdown dropdown-end z-[120]">
    <label tabindex="0" class="btn btn-circle btn-error m-1">
        <Icon path={mdiDelete} class="w-4 h-4" />
    </label>
    <ul
        tabindex="0"
        class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 "
    >
        <li>
            <a on:click={() => dispatch("confirm")}>Confirm Delete</a>
        </li>
    </ul>
</div>
