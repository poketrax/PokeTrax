#!/bin/sh
cd ../src-tauri
cargo tauri dev &
cd ../src-web
npm run dev

