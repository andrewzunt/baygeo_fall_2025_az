<script setup>
import { onMounted, ref } from "vue";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import neighborhoods from "./map/neighborhoods-with-sites.json";
import style from "./map/style.json";

const attribution = ref();
const mapContainer = ref();
const fillColorStyle = ref();
const hoverFeature = ref();

const legendEntries = computed(() => {
  const entries = [];
  let fromValue = 0;

  if(fillColorStyle.value) {
    const styleArray = fillColorStyle.value.toSpliced(0, 2);
    for(let index = 0; index < styleArray.length; index += 2) {
      const toValue = styleArray[index + 1];
      const entry = {
        color: styleArray[index],
        text: (index == styleArray.length - 1)
                ? `>= ${fromValue}`
                : `${fromValue}-${toValue - 1}`
      }
      entries.push(entry);
      fromValue = toValue;
    }
  }
  return entries;
});

onMounted(() => {
  const map = new maplibregl.Map({
    "container": mapContainer.value,
    "style": style,
    "attributionControl": false,
    "bounds": [
      -118.65226,
      33.70555313153153,
      -118.15570589019399,
      34.333050872231304
    ],
    "fitBoundsOptions": {
      "padding": 50,
      "pitch": 45
    }
  });

  map.addControl(new maplibregl.AttributionControl({
    compact: true,
    customAttribution: attribution.value.innerHTML
  }));

  map.addControl(new maplibregl.NavigationControl());
  map.addControl(new maplibregl.ScaleControl());

  map.on("load", () => {
    // map.getSource("sites")
    //    .setData(sites);
      //  .getBounds()
      //  .then((bounds) => {
      //   console.log(bounds);
      //  });
    
    map.getSource("neighborhoods")
       .setData(neighborhoods);

    fillColorStyle.value = map.getPaintProperty("neighborhoods-fill",
                                                "fill-extrusion-color");
                                        

    map.on("mousemove", "neighborhoods-fill", (event) => {
      hoverFeature.value = event.features[0];
      map.removeFeatureState({
        source: "neighborhoods"
      });
      map.setFeatureState(event.features[0], {
        hover: true
      })
    })

    map.on("mouseleave", "neighborhoods-fill", () => {
      hoverFeature.value = null;
      map.removeFeatureState({
        source: "neighborhoods"
      });
    })
  })
});
</script>

<template>
  <div class="container">
    <div class="panel">
      <div class="title">
        Catalogued historic sites in Los Angeles by neighborhood
      </div>
      <div class="subtitle">
        Andrew Zunt, October 2025
      </div>
    </div>
    <div class="content">
      <div ref="mapContainer" class="map"></div>
      <div class="panel popup" v-if="hoverFeature">
        <div class="title">
          {{ hoverFeature.properties.name }}
        </div>
        <div>
          {{ hoverFeature.properties.sitesCount }} historic site(s) catalogued
        </div>

      </div>
      <div class="panel legend">
        <div class="title">
          # of sites catalogued
        </div>
        <div v-for="entry in legendEntries">
          <span class="color" v-bind:style="{ backgroundColor: entry.color }"></span>
          <span>{{ entry.text }}</span>
        </div>
      </div>
    </div>
  </div>
  <div ref="attribution" class="hidden">
    <a href="https://hpla.lacity.org/" target="_blank">
      Historic Places LA
    </a>
    |
    <a href="https://geohub.lacity.org/" target="_blank">
      Los Angeles GeoHub
    </a>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.content {
  flex-grow: 1;
  position: relative
}

.map {
  height: 100%;
}

/* Used to hide before page loads */
.hidden {
  display: none;
}

.panel {
  padding: 10px;
  background-color: rgb(255, 209, 139);
  border: 1px solid black;
}

.title {
  font-weight: 600;
}

.subtitle {
  font-size: 0.9em;
}

.color {
  display: inline-block;
  height: 10px;
  width: 10px;
  border: 1px solid black;
  margin-right: 5px;
}

.legend {
  position: absolute;
  bottom: 50px;
  right: 10px;
  font-size: 0.9em;
}

.popup {
  position: absolute;
  top: 10px;
  right: 50px;
  font-size: 0.8em;
}

</style>