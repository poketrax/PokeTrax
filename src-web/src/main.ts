import App from "./App.svelte";
import { init } from "./lib/Utils";

const app = new App({
  target: document.getElementById("app"),
});

init();

export default app;
