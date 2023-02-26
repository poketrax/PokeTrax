#!/bin/sh
cd ../src-tauri 
PK_DATA_DIR="../src-web/cypress/test-data" POKETRAX_DAEMON=true cargo tauri dev