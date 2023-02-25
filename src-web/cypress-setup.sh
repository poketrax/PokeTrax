#!/bin/sh
cd ../src-tauri
cargo install tauri-cli
PK_DATA_DIR="../src-web/cypress/test-data" POKETRAX_DAEMON=true cargo tauri dev &
cd ../src-web
npm run dev &