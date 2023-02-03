import * as fs from "fs";

let updateFile = "../docs/update.json";
let tauriFile = fs.readFileSync("../src-tauri/tauri.conf.json");
let tauri = JSON.parse(tauriFile);
let version = tauri.package.version;

let darwin_x86 = `https://github.com/poketrax/PokeTrax/releases/download/v${version}/PokeTrax.app.tar.gz`;
let darwin_appl = `https://github.com/poketrax/PokeTrax/releases/download/v${version}/silicon/PokeTrax.app.tar.gz`;
let linux_x86 = `https://github.com/poketrax/PokeTrax/releases/download/v${version}/Poketrax.AppImage.tar.gz`;
let win_x86 = `https://github.com/poketrax/PokeTrax/releases/download/v${version}/PokeTrax.x64.msi.zip`;

let tauriUpdate = {
  version: `v${version}`,
  pub_date: new Date().toISOString(),
  platforms: {
    "darwin-x86_64": {
      signature: "",
      url: darwin_x86,
    },
    "darwin-aarch64": {
      signature: "",
      url: darwin_appl,
    },
    "linux-x86_64": {
      signature: "",
      url: linux_x86,
    },
    "windows-x86_64": {
      signature: "",
      url: win_x86,
    },
  },
};

fs.writeFileSync(updateFile, JSON.stringify(tauriUpdate, null, 1));