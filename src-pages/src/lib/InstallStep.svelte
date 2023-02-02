<script lang="ts">
  export let number: number
  export let text: string
  export let img
</script>

<div>
    <div class="flex items-center">
        <div class="flex h-10 w-10 bg-slate-200 rounded-full items-center justify-center mr-10 ml-10 mt-5 mb-5">
            <div>{number}</div>
        </div>
        <div>{@html text}</div>
    </div>
    {#if img != null}
    <div class="flex ml-32">
        <img src={img} alt={text}/>
    </div>
    {/if}
</div>
