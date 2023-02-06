<script>
  import { DbState, dbStatus } from "../lib/CardSearchStore";
  import PokeBallSpinner from "../components/Shared/PokeBallSpinner.svelte";
  let status = new DbState();
  dbStatus.subscribe((val) => {
    status = val;
  });
</script>

<div class="flex h-screen">
  <div class="flex-grow" />
  <div class="grid">
    <div>{status.msg}</div>
    <div class="classic-10" />
    <PokeBallSpinner />
  </div>
  <div class="flex-grow" />
</div>

<style>
  .classic-10 {
    --w: 10ch;
    font-weight: bold;
    font-family: monospace;
    font-size: 30px;
    line-height: 1.4em;
    letter-spacing: var(--w);
    width: var(--w);
    overflow: hidden;
    white-space: nowrap;
    color: #0000;
    text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
      calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
      calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
      calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
      calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    animation: c10 2s infinite linear;
  }
  .classic-10:before {
    content: "Loading...";
  }

  @keyframes c10 {
    9.09% {
      text-shadow: calc(0 * var(--w)) -10px #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    }
    18.18% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) -10px #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    }
    27.27% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) -10px #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    }
    36.36% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) -10px #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    }
    45.45% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) -10px #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    }
    54.54% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) -10px #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    }
    63.63% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) -10px #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    }
    72.72% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) -10px #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) 0 #000;
    }
    81.81% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) -10px #000, calc(-9 * var(--w)) 0 #000;
    }
    90.90% {
      text-shadow: calc(0 * var(--w)) 0 #000, calc(-1 * var(--w)) 0 #000,
        calc(-2 * var(--w)) 0 #000, calc(-3 * var(--w)) 0 #000,
        calc(-4 * var(--w)) 0 #000, calc(-5 * var(--w)) 0 #000,
        calc(-6 * var(--w)) 0 #000, calc(-7 * var(--w)) 0 #000,
        calc(-8 * var(--w)) 0 #000, calc(-9 * var(--w)) -10px #000;
    }
  }
</style>
