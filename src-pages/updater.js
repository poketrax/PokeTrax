import * as fs from "fs";
import fetch from "node-fetch";

let updateFile = "../docs/update.json";
let tauriFile = fs.readFileSync("../src-tauri/tauri.conf.json");
let tauri = JSON.parse(tauriFile);
let version = tauri.package.version;

async function run() {
  let darwin_x86 = `https://github.com/poketrax/PokeTrax/releases/download/v${version}/PokeTrax.app.tar.gz`;
  let darwin_x86_sig = await (
    await fetch(
      `https://github.com/poketrax/PokeTrax/releases/download/v${version}/PokeTrax.app.tar.gz.sig`
    )
  ).text();

  let darwin_appl = `https://github.com/poketrax/PokeTrax/releases/download/v${version}/PokeTrax.app.tar.gz`;
  let darwin_appl_sig = await (
    await fetch(
      `https://github.com/poketrax/PokeTrax/releases/download/v${version}/PokeTrax.app.tar.gz.sig`
    )
  ).text();

  let linux_x86 = `https://github.com/poketrax/PokeTrax/releases/download/v${version}/Poketrax.AppImage.tar.gz`;
  let linux_x86_sig = await (
    await fetch(
      `https://github.com/poketrax/PokeTrax/releases/download/v${version}/poke-trax_${version}_amd64.AppImage.tar.gz.sig`
    )
  ).text();

  let win_x86 = `https://github.com/poketrax/PokeTrax/releases/download/v${version}/PokeTrax.x64.msi.zip`;
  let win_x86_sig = await (
    await fetch(
      `https://github.com/poketrax/PokeTrax/releases/download/v${version}/PokeTrax_${version}_x64_en-US.msi.zip.sig`
    )
  ).text();

  let tauriUpdate = {
    version: `v${version}`,
    pub_date: new Date().toISOString(),
    platforms: {
      "darwin-x86_64": {
        signature: darwin_x86_sig,
        url: darwin_x86,
      },
      "darwin-aarch64": {
        signature: darwin_appl_sig,
        url: darwin_appl,
      },
      "linux-x86_64": {
        signature: linux_x86_sig,
        url: linux_x86,
      },
      "windows-x86_64": {
        signature: win_x86_sig,
        url: win_x86,
      },
    },
  };

  fs.writeFileSync(updateFile, JSON.stringify(tauriUpdate, null, 1));
}

run()