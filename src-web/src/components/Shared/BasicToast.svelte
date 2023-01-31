<script lang="ts">
    import { timer } from "rxjs";
    export let type = "alert-info";
    export let period = 2000;
    export let message: string;
    export let toastLocation = "toast toast-top toast-end";
    let visbable = false;

    export function show() {
        visbable = true;
        startTimer();
    }

    function startTimer() {
        let sub = timer(period, 0).subscribe(() => {
            visbable = false;
            sub.unsubscribe();
        });
    }
</script>

<div class={toastLocation}>
    <!--Success-->
    {#if visbable}
        <div class="alert {type}">
            <div>
                <span>{message}</span>
            </div>
        </div>
    {/if}
</div>

<!--Prevent tree shaking for dynamic classes-->
<style>
    .alert-info {
    }
    .alert-success {
    }
    .alert-error {
    }
    .toast {
    }
    .toast-top {
    }
    .toast-end {
    }
</style>
