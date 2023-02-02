<script lang="ts">
    import Disclaimer from "./lib/Disclaimer.svelte";
    import macOs from "./assets/brands/macos.png";
    import win from "./assets/brands/windows.png";
    import ubuntu from "./assets/brands/ubuntu.png";
    import appImage from "./assets/brands/AppImage.png";
    import trackPrices from "./assets/track_prices.png";
    import sets from "./assets/sets.png";
    import trackCollection from "./assets/track_collection.png";

    let versionName = "";
    let version = ""
    let fresh = false;

    fetch("https://api.github.com/repos/poketrax/poketrax/releases/latest")
        .then((res) => res.json())
        .then((data) => {
            versionName = data.name;
            version = data.name.replace("v", "");
            let now = new Date(Date.now())
            let week = new Date(now.getFullYear(), now.getMonth(), now.getDate()-7);
            let release = new Date(data.published_at)
            if(week.getTime() < release.getTime()){
                fresh = true
            }
        });
</script>

<div class="w-screen h-[calc(100vh-4rem)] overflow-x-hidden overflow-auto">
    <div class="w-screen flex">
        <div class="flex-grow" />
        <div>
            <div class="h-10" />
            <span class="flex text-3xl portrait:text-xl text-center p-4">
                A simple, free, fully featured, and open source Pokémon TCG
                collection manager for Windows, Mac, and Ubuntu
            </span>
            <div class="h-10" />
            <div class="flex">
                <div class="flex-grow" />
                <a
                    href="https://github.com/poketrax/PokeTrax/releases/latest/download/PokeTrax_{version}_x64.dmg"
                    ><img
                        class="h-20 object-contain cursor-pointer"
                        src={macOs}
                        alt="macos"
                    />
                </a>
                <div class="w-6" />
                <a
                    href="https://github.com/poketrax/PokeTrax/releases/latest/download/PokeTrax_{version}_x64_en-US.msi"
                    ><img
                        class="h-20 object-contain cursor-pointer"
                        src={win}
                        alt="win"
                    /></a
                >
                <div class="w-6" />
                <a
                    href="https://github.com/poketrax/PokeTrax/releases/latest/download/poke-trax_{version}_amd64.deb"
                    ><img
                        class="h-20 object-contain cursor-pointer"
                        src={ubuntu}
                        alt="linux"
                    />
                </a>
                <div class="w-6" />
                <a
                    href="https://github.com/poketrax/PokeTrax/releases/latest/download/poke-trax_{version}_amd64.AppImage
                    "
                    ><img
                        class="h-20 object-contain cursor-pointer"
                        src={appImage}
                        alt="linux"
                    />
                </a>
                <div class="flex-grow" />
            </div>
            <div class="flex h-10 items-center justify-center">
                {#if fresh}
                <span class="mr-2 text-yellow-300">🔆</span>
                {/if}
                <span>{version}</span>
            </div>
            <div class="flex">
                <div class="flex-grow" />
                <iframe
                    class="lg:w-[960px] lg:h-[540px] md:w-[480px] md:h-[270px] w-[240px] h-[135px]"
                    src="https://www.youtube.com/embed/IwA2w_Rh2Xc?autoplay=1&vq=hd720"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                />
                <div class="flex-grow" />
            </div>
        </div>
        <div class="flex-grow" />
    </div>
    <div class="h-12" />
    <div class="flex w-screen bg-gray-200 items-center">
        <div class="p-16 portrait:p-4">
            <img
                src={trackPrices}
                class="h-96 portrait:h-48 object-contain"
                alt="track prices"
            />
        </div>
        <div class="text-3xl portrait:text-xl portrait:m-4">
            Analyze card prices over time
        </div>
        <div class="flex-grow" />
    </div>

    <div class="flex w-screen items-center">
        <div class="flex-grow" />
        <div class="text-3xl portrait:text-xl portrait:m-4">
            Track cards and sealed products in your collection
        </div>
        <div class="p-16">
            <img
                src={trackCollection}
                class="h-96 portrait:h-48 object-contain"
                alt="track cards"
            />
        </div>
    </div>

    <div class="flex w-screen bg-gray-200 items-center">
        <div class="p-16">
            <img
                src={sets}
                class="h-96 portrait:h-48 object-contain"
                alt="sets"
            />
        </div>
        <div class="w-8" />
        <div class="text-3xl portrait:text-xl portrait:m-4">
            Browse sets for cards
        </div>
        <div class="flex-grow" />
    </div>

    <Disclaimer />
</div>
