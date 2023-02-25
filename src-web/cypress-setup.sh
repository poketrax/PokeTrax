#!/bin/sh
cd ../src-tauri
cargo install tauri-cli
cargo tauri dev &
cd ../src-web
npm run dev