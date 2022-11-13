<script lang="ts">
    let clazz = ""
    export { clazz as class };
    export let path = "";
    export let color = "";
    let fill = color

    let data = btoa(
		`<svg viewBox="0 0 24 24" style="fill: ${fill}" xmlns="http://www.w3.org/2000/svg">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="${path}"
				/>
			</svg>`)
	let img_src = `data:image/svg+xml;base64,${data}`
</script>

<div class="{clazz}">
    <img class="w-full h-full" src={img_src} alt="" />
</div>