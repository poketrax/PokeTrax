<script lang="ts">
  import { ScaleTypes } from "@carbon/charts/interfaces";
  import { StackedAreaChart } from "@carbon/charts-svelte";
  import { activeData, versionData } from "./lib/store";
  import "@carbon/styles/css/styles.css";
  import "@carbon/charts/styles.css";
  import { add_classes } from "svelte/internal";

  fetch(`https://api.github.com/repos/poketrax/pokedata/releases`)
    .then((response) => response.json())
    .then((data) => {
      let stats = [];
      for (let i = data.length - 1; i >= 0; i--) {
        let tag = data[i];
        let count = tag.assets[0].download_count;
        let found = stats.find((val) => {
          let valDate = new Date(val.date);
          valDate.setHours(0, 0, 0, 0);
          let currDate = new Date(tag.published_at);
          currDate.setHours(0, 0, 0, 0);
          return valDate.getTime() === currDate.getTime();
        });

        if (found) {
          found.count += count;
        } else {
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
        let mac = 0;
        let linux = 0;
        let win = 0;
        tag.assets.forEach((asset) => {
          if (asset.name.match(/AppImage|snap|deb/g))
            linux += asset.download_count;
          if (asset.name.match(/dmg/g)) mac += asset.download_count;
          if (asset.name.match(/exe|msi/)) win += asset.download_count;
        });
        stats.push({
          group: "MAC",
          version: tag.tag_name,
          count: mac,
        });
        stats.push({
          group: "WIN",
          version: tag.tag_name,
          count: win,
        });
        stats.push({
          group: "LINUX",
          version: tag.tag_name,
          count: linux,
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
          scaleType: ScaleTypes.LINEAR,
          mapsTo: "count",
        },
        bottom: {
          scaleType: ScaleTypes.TIME,
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
          scaleType: ScaleTypes.LINEAR,
          mapsTo: "count",
        },
        bottom: {
          scaleType: ScaleTypes.LABELS,
          mapsTo: "version",
        },
      },
      curve: "curveMonotoneX",
      height: "400px",
    }}
  />
</div>
