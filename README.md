# PokeTrax

Pokemon Card Data tracking card collection

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)


## Run Backend server

Normal
```sh
cargo tauri dev
```
Stack Trace
```sh
RUST_BACKTRACE=1 cargo tauri dev 
```



## Build

```sh
cd src-web 
npm run build
cd ..
cargo tauri build
```

## ENV variables

PK_DATA_DIR="./data" Data directory for data files

## Headless Usage

Symlink to executable for headless

```sh
ln -s /Applications/CardTrax.app/Contents/MacOS/CardTrax poketrax
```

```sh
poketrax -h
```