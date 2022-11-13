#!/bin/sh
cd src-web 
npm run build
cd ..
cargo tauri build