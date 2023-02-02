<script lang="ts">
    import { StackedAreaChart } from "@carbon/charts-svelte";
    import { activeData, versionData } from "./lib/store";
    import "@carbon/styles/css/styles.css";
    import "@carbon/charts/styles.css";

    fetch(`https://api.github.com/repos/poketrax/pokepull/releases`)
        .then((response) => response.json())
        .then((data) => {
            let stats = [];
            for (let i = data.length - 1; i >= 0; i--) {
                let tag = data[i];
                let count = tag.assets[0].download_count;
                let found = stats.find((val) => {
                    let valDate = new Date(val.date)
                    valDate.setHours(0,0,0,0)
                    let currDate = new Date(tag.published_at)
                    currDate.setHours(0,0,0,0)
                    return valDate.getTime() === currDate.getTime()
                })
                
                if(found){
                    
                    found.count += count
                }else{
                    stats.push({
                        date: tag.published_at,
                        count: count,
                        group: "Users",
                    });
                }
                    
            }
            activeData.set(stats);
        });

    let activeDataVal = [];
    activeData.subscribe((val) => {
        console.log(val);
        activeDataVal = val;
    });

    fetch(`https://api.github.com/repos/poketrax/poketrax/releases`)
        .then((response) => response.json())
        .then((data) => {
            let stats = [];
            for (let i = data.length - 1; i >= 0; i--) {
                let tag = data[i];
                tag.assets.forEach((asset, i) => {
                    let name = "";
                    switch (i) {
                        case 0:
                            name = "DMG";
                            break;
                        case 1:
                            name = "EXE";
                            break;
                        case 2:
                            name = "SNAP";
                            break;
                        default:
                            name = "";
                    }
                    stats.push({
                        group: name,
                        version: tag.tag_name,
                        count: asset.download_count,
                    });
                });
            }
            versionData.set(stats);
        });

    let versionDataVal = [];
    versionData.subscribe((val) => {
        versionDataVal = val;
    });
</script>

<div class="h-12 pl-4 bg-slate-200 w-screen flex items-center">
    <span>Estimated Active users</span>
</div>
<div class="pr-10 pl-10 pb-10">
    <StackedAreaChart
        data={activeDataVal}
        options={{
            axes: {
                left: {
                    stacked: true,
                    scaleType: "linear",
                    mapsTo: "count",
                },
                bottom: {
                    scaleType: "time",
                    mapsTo: "date",
                },
            },
            curve: "curveMonotoneX",
            height: "400px",
        }}
    />
</div>

<div class="h-12 pl-4  bg-slate-200 w-screen flex items-center">
    <span>Version Downloads</span>
</div>
<div class="pr-10 pl-10 ">
    <StackedAreaChart
        data={versionDataVal}
        options={{
            axes: {
                left: {
                    stacked: true,
                    scaleType: "linear",
                    mapsTo: "count",
                },
                bottom: {
                    scaleType: "labels",
                    mapsTo: "version",
                },
            },
            curve: "curveMonotoneX",
            height: "400px",
        }}
    />
</div>
