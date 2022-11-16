<script lang="ts">
    import logo from "../../assets/poketrax.png"
    import { page } from "../../lib/Utils";
</script>

<div class="sticky top-0 w-full h-16 bg-gray-400 flex flex-row">
    <div class="h-16 flex-none flex flex-row">
        <img
            class="h-16 w-16 p-1"
            src={logo}
            alt="logo"
        />
        <span class="font-sans text-3xl pt-3 pl-2">
            PokéTrax
        </span>
        <span class="pl-6 flex ">
            <button
                id="cards-page"
                class="hover:text-blue-700"
                on:click={()=> page.set("cards")}
            >
                Cards
            </button>
            <div class="w-6"></div>
            <button
                id="sets-page"
                class="hover:text-blue-700"
                on:click={() => {page.set("sets")}}
            >
                Sets
            </button>
            <div class="w-6"></div>
            <button
                id="sealed-page"
                class="hover:text-blue-700"
                on:click={() => {page.set("sealedProducts")}}
            >
                Sealed Products
            </button>
            <div class="w-6"></div>
            <button
                id="collection-page"
                class="hover:text-blue-700"
                on:click={() => {page.set("collections")}}
            >
                Collection
            </button>
            <div class="w-6"></div>
            <button
                id="collection-page"
                class="hover:text-blue-700"
                on:click={() => {page.set("admin")}}
            >
                Mods
            </button>
        </span>
    </div>
</div>