# <img src="public/assests/poketrax.png" width="50" height="50"> Pokétrax: Pokémon TCG Collection Manger

## UI Development 
This will start the node backend and the web page for testing and development.  This will not start the electon framework.

1. Start dev server and web app
    ```
    npm run start-test-server
    npm start
    ```
2. Open web browser to http://localhost:3000

## Electron Testing
This will start the electron framework and tie it to the vite devopment server. This will execute the electron framework.

1. Start test electron and web server
   ```
   npm start
   npm run start-electron
   ```

## Build Electron app

1. Build installer for your host
   ```
   npm run make
   ```

## Run Cypress End-to-End Tests

* Run all tests headless
   ```
   npm run test-cypress
   ```
* Start Cypress UI
   ```
   npx cypress open
   ```   