<script lang="ts">
    import InstallStep from "./lib/InstallStep.svelte";
    import Title from "./lib/Title.svelte";
    import macOs from "./assets/brands/macos.png";
    import win from "./assets/brands/windows.png";
    import window_warning from "./assets/install/windows/windows_warning.png";
    import windows_accept from "./assets/install/windows/windows_accept.png";
    import mac_open_err from "./assets/install/macos/macos_open_err.png";
    import mac_open_sys_pref from "./assets/install/macos/macos_open_sys_pref.png";
    import mac_sys_pref from "./assets/install/macos/macos_sys_pref.png";
    import mac_sec from "./assets/install/macos/macos_sec.png";
    import Disclaimer from "./lib/Disclaimer.svelte";
</script>

<div class="w-screen h-[calc(100vh-4rem)] overflow-x-hidden overflow-auto">
    <div>
        <div class="flex w-screen h-20 bg-gray-200 items-center">
            <img
                class="h-20 object-contain cursor-pointer"
                src={win}
                alt="windows"
            />
            <div class="pl-8 text-3xl">Windows install instructions</div>
        </div>
        <div class="w-screen">
            <InstallStep
                number={1}
                text={`Download exe from <a class="text-blue-600" href="https://github.com/poketrax/PokeTrax/releases/latest/download/poketrax.exe">here</a> and install PokeTrax`}
                img={null}
            />
            <InstallStep
                number={2}
                text="You will get an error that looks like this. Click 'More Info'"
                img={window_warning}
            />
            <InstallStep
                number={3}
                text="Click 'Run anyway'"
                img={windows_accept}
            />
        </div>
    </div>
    <div class="h-8" />
    <div>
        <div class="flex w-screen h-20 bg-gray-200 items-center">
            <img
                class="h-20 object-contain cursor-pointer"
                src={macOs}
                alt="macos"
            />
            <div class="pl-8 text-3xl">Mac OS install instructions</div>
        </div>
        <div class="w-screen">
            <InstallStep
                number={1}
                text={`Download dmg from <a class="text-blue-600" href="https://github.com/poketrax/PokeTrax/releases/latest/download/poketrax.dmg">here</a> and install PokeTrax`}
                img={null}
            />
            <InstallStep
                number={2}
                text={`Run PokeTrax you will get the following error. Click 'Cancel'`}
                img={mac_open_err}
            />
            <InstallStep
                number={3}
                text={`Click the Apple logo at the top left of you screen, Then click 'System Preferences'`}
                img={mac_open_sys_pref}
            />
            <InstallStep
                number={4}
                text={`On the system preferences window. Click 'Security & Privacy'`}
                img={mac_sys_pref}
            />
            <InstallStep
                number={5}
                text={`On the General Tab in the 'Security & Privacy' window. Click 'Open Anyway'`}
                img={mac_sec}
            />
        </div>
    </div>
    <Disclaimer />
</div>
