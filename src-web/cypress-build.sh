#!/bin/sh
cd ../src-tauri
cargo install tauri-cli
cargo tauri build &
cd ../src-web
npm run build