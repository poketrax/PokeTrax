<script lang="ts">
    export let label = "";
    export let metaData: any;
</script>

<div class="flex items-center">
    <img class="h-4 w-4 ml-2 mr-2 object-contain" src={metaData.imgSrc} alt="" />
    <div>{label}</div>
</div>

