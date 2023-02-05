<script lang="ts">
    import { PokeRarity } from "tcg-case";
    export let label = "";
</script>

<div class="flex items-center">
    <PokeRarity class="ml-2 w-6 h-6" rarity={label} />
    <div>{label}</div>
</div>

