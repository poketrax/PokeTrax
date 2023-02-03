<script lang="ts">
import { page } from "../lib/store"
import icon from "../assets/icon.png";
import Github from "./Github.svelte";
import Reddit from "./Reddit.svelte";
import Youtube from "./Youtube.svelte";
import Twitter from "./Twitter.svelte";
import ChartIcon from "./ChartIcon.svelte";

function gotoInstall() {
  page.set("install")
}

</script>

<div class="h-16 w-screen bg-blue-800 flex items-center">
    
    <ChartIcon/>

    <div class="flex-grow" />
    <img class="h-16 w-16 portrait:h-10 portrait:w-10" src={icon} alt="icon" />
    <div class="w-4" />
    <a
        class="text-white text-4xl  portrait:text-xl title-font cursor-pointer"
        href=".">Pokétrax
    </a>
    <div class="w-96" />
    <a
        class="text-white hover:text-red-600 cursor-pointer portrait:hidden"
        href="https://github.com/poketrax/PokeTrax/issues"
        >Issues
    </a>
    <div class="w-4" />
    <span
        class="text-white hover:text-red-600 cursor-pointer portrait:hidden"
        on:click={gotoInstall}
        >Install
    </span>
    <div class="w-4" />
    <a class="m-2" href="https://github.com/poketrax/PokeTrax">
        <Github />
    </a>
    <a class="m-2" href="https://www.reddit.com/r/poketraxapp/">
        <Reddit />
    </a>
    <a
        class="m-2"
        href="https://www.youtube.com/channel/UCDGebTpvhiRCy3Aw6_CDylg"
        >
        <Youtube/>
    </a>
    <a class="p-2" href="https://twitter.com/poketrax_app">
        <Twitter />
    </a>
    <div class="flex-grow" />
    <ChartIcon/>
</div>
