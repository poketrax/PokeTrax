import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    taskTimeout: 20000,
    execTimeout: 20000,
    video: false
  },
});
