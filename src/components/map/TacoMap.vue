<script setup lang="ts">
/**
 * TacoMap component.
 *
 * Renders a full-viewport Mapbox GL JS map (streets-v12 style, softened by a
 * CSS `saturate`/`brightness` filter for a "faded postcard" look) with 3D
 * building extrusions and custom taco-emoji markers for every taco shop
 * returned by the Mapbox Search Box API. On mount it:
 *   1. Initialises the map centred on Portland, OR (the fallback location).
 *   2. Adds the 3D-buildings fill-extrusion layer once tiles have loaded.
 *   3. Requests the user's geolocation; on success flies to their position and
 *      fetches nearby shops; on failure falls back silently to Portland.
 *
 * Each marker is a keyboard-accessible 32×32 px taco-orange circular badge
 * containing the 🌮 emoji. Clicking or pressing Enter on a marker calls
 * `mapStore.selectShop()` and flies the camera to that shop at zoom 15 /
 * pitch 60. The marker layer is rebuilt reactively whenever `mapStore.shops`
 * changes.
 *
 * The Mapbox instance is destroyed in `onUnmounted` to prevent memory leaks.
 *
 * @example
 * ```vue
 * <!-- Renders the full map; no props needed -->
 * <TacoMap />
 * ```
 */
import mapboxgl from 'mapbox-gl'
import { shallowRef, watch, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { useGeolocation } from '@/composables/useGeolocation'
import type { MapboxTacoShop } from '@/types/mapbox'

/**
 * Events emitted by TacoMap.
 *
 * @emits userMove — Fires when the user pans/zooms the map (NOT for
 *   programmatic camera moves like `flyTo`/`fitBounds`). The payload is the
 *   new map center; parents typically show a "Search this area" affordance.
 */
const emit = defineEmits<{
  userMove: [center: { lat: number; lng: number }]
}>()

/** Pinia store that owns the list of taco shops and the currently selected one. */
const mapStore = useMapStore()

/** Composable that wraps `navigator.geolocation.getCurrentPosition`. */
const { getLocation } = useGeolocation()

/**
 * Shallow ref holding the live Mapbox GL `Map` instance.
 * `shallowRef` is used intentionally — deep reactivity on a Mapbox Map
 * object would cause severe performance problems.
 */
const map = shallowRef<mapboxgl.Map | null>(null)

/**
 * Shallow ref holding the array of currently rendered Mapbox `Marker`
 * instances. Tracked so that all markers can be removed before a new
 * batch is added.
 */
const markers = shallowRef<mapboxgl.Marker[]>([])

/**
 * Longitude of Portland, OR — used as the geolocation fallback centre.
 * Value: -122.6765
 */
const PORTLAND_LNG = -122.6765

/**
 * Latitude of Portland, OR — used as the geolocation fallback centre.
 * Value: 45.5231
 */
const PORTLAND_LAT = 45.5231

/**
 * Removes every Mapbox marker currently mounted on the map and empties the
 * tracking array. Called before `addMarkers` to prevent duplicate pins when
 * the shop list is refreshed.
 */
function clearMarkers() {
  markers.value.forEach((marker) => marker.remove())
  markers.value = []
}

/**
 * Creates and mounts a custom taco-emoji marker for each shop in the supplied
 * array, replacing any previously rendered markers.
 *
 * Each marker element is a `<div>` styled as a white circular badge (32×32 px)
 * containing the 🌮 emoji. The element receives `tabIndex=0`, `role="button"`,
 * and an `aria-label` so it is keyboard-accessible and screen-reader
 * friendly. Pressing Enter fires the same `selectAndFly` handler as a click.
 *
 * @param shops - The array of Yelp businesses to render as map pins.
 *
 * @example
 * ```ts
 * // Called reactively whenever mapStore.shops changes:
 * addMarkers(mapStore.shops)
 * ```
 */
function addMarkers(shops: MapboxTacoShop[]) {
  clearMarkers()
  shops.forEach((shop: MapboxTacoShop) => {
    const el = document.createElement('div')
    el.className = 'taco-pin'
    el.innerHTML = '🌮'
    el.tabIndex = 0
    el.setAttribute('aria-label', `Taco shop: ${shop.name}`)
    el.setAttribute('role', 'button')

    /**
     * Selects the shop in the Pinia store and animates the camera to
     * centre on it at zoom 15 with a 60-degree pitch for a 3D effect.
     */
    const selectAndFly = () => {
      mapStore.selectShop(shop)
      map.value?.flyTo({
        center: [shop.coordinates.longitude, shop.coordinates.latitude],
        zoom: 15,
        pitch: 60,
      })
    }

    el.addEventListener('click', selectAndFly)
    el.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') selectAndFly()
    })

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([shop.coordinates.longitude, shop.coordinates.latitude])
      .addTo(map.value as mapboxgl.Map)

    markers.value.push(marker)
  })
}

/**
 * Watcher: rebuilds the marker layer whenever the Pinia shop list changes
 * and refits the camera to the bounding box of all shops so they're all
 * visible (avoids the "all pins ganged up in a corner" case where Mapbox's
 * initial viewport was smaller than the eventual fixed-position container).
 *
 * Uses `deep: true` because `mapStore.shops` is an array that may be replaced
 * in its entirety or mutated in place.
 */
watch(
  () => mapStore.shops,
  (shops) => {
    if (!map.value || shops.length === 0) {
      if (map.value) addMarkers(shops)
      return
    }
    addMarkers(shops)

    const bounds = new mapboxgl.LngLatBounds()
    shops.forEach((s) => bounds.extend([s.coordinates.longitude, s.coordinates.latitude]))

    map.value.fitBounds(bounds, {
      padding: { top: 100, right: 60, bottom: 120, left: 60 },
      maxZoom: 15,
      duration: 700,
    })
  },
  { deep: true }
)

/**
 * Lifecycle hook: initialises the Mapbox map, registers the 3D-buildings
 * layer, and kicks off geolocation + shop fetching.
 *
 * Reads `VITE_MAPBOX_TOKEN` from Vite's `import.meta.env` to authenticate
 * with the Mapbox Tiles API. The map starts over Portland so the user sees
 * something immediately while geolocation resolves.
 */
onMounted(() => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

  map.value = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 14,
    pitch: 45,
    /* Keep the camera tilted even as the user zooms out. Mapbox normally
       gradually flattens pitch toward 0 at low zooms; clamping minPitch
       preserves the cantina-postcard 3D feel across the whole zoom range. */
    minPitch: 35,
    maxPitch: 70,
    bearing: 0,
    center: [PORTLAND_LNG, PORTLAND_LAT],
  })

  map.value.on('load', () => {
    map.value?.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      type: 'fill-extrusion',
      paint: {
        'fill-extrusion-color': '#b8a78d',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-opacity': 0.55,
      },
    })
    // Belt-and-suspenders: force a resize once style + container are settled.
    // The container is `position: fixed` set via CSS that may not be applied
    // at Mapbox construction time, especially on mobile where the dynamic
    // viewport (dvh) settles a tick late.
    map.value?.resize()
  })

  /**
   * Fire `userMove` only for user-initiated camera changes. Mapbox sets
   * `e.originalEvent` to the user's pointer/wheel/touch event for manual
   * interactions; programmatic moves (`flyTo`, `fitBounds`, `easeTo`)
   * have a null `originalEvent`, so the parent never gets spurious
   * "Search this area" prompts after our own `fitBounds` resets.
   */
  map.value.on('moveend', (e) => {
    if (!e.originalEvent) return
    const center = map.value!.getCenter()
    emit('userMove', { lat: center.lat, lng: center.lng })
  })

  getLocation()
    .then(({ lat, lng }) => {
      map.value?.flyTo({ center: [lng, lat], zoom: 14, pitch: 45 })
      return mapStore.fetchShops(lat, lng)
    })
    .catch(() => {
      // Silent fallback to Portland defaults
      mapStore.fetchShops(PORTLAND_LAT, PORTLAND_LNG).catch(() => {
        // store handles the error state
      })
    })
})

/**
 * Lifecycle hook: tears down the map instance and removes all markers to
 * avoid memory leaks when the component is unmounted (e.g. navigating away
 * from MapView).
 */
onUnmounted(() => {
  clearMarkers()
  map.value?.remove()
  map.value = null
})
</script>

<template>
  <div id="map" class="taco-map" />
</template>

<style scoped>
.taco-map {
  width: 100%;
  height: 100%;
}

/* Faded-postcard look applied ONLY to the basemap canvas — markers and
   controls are sibling HTML elements and stay full-saturation, so the
   orange taco pins still pop against the warm-toned tiles. */
.taco-map :deep(.mapboxgl-canvas) {
  filter:
    saturate(0.4)
    brightness(1.03)
    contrast(0.94)
    sepia(0.28)
    hue-rotate(-10deg);
}
</style>

<style>
/* Unscoped — Mapbox wraps user-provided marker elements in a `.mapboxgl-marker`
   container and sets `transform: translate(...)` on that container to position
   it on the map. If we animate `transform` on the marker element (which IS the
   `.mapboxgl-marker` in mapbox-gl v3), CSS animations override the inline
   transform and every marker stacks at (0, 0). To avoid that, all motion uses
   the independent `scale` / `translate` CSS properties, which compose with
   `transform` instead of replacing it. */
.taco-pin {
  width: 36px;
  height: 36px;
  background: radial-gradient(circle at 30% 28%, #ffb27a 0%, #ff6b35 55%, #e11d48 100%);
  border: 2px solid #fff8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 17px;
  line-height: 1;
  box-shadow:
    0 6px 14px rgba(225, 29, 72, 0.45),
    0 2px 4px rgba(20, 6, 8, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: scale 0.18s cubic-bezier(0.2, 0.9, 0.25, 1.2),
    translate 0.18s ease,
    box-shadow 0.18s ease;
  animation: pinDrop 380ms cubic-bezier(0.2, 0.9, 0.25, 1.4) both;
}

.taco-pin:hover,
.taco-pin:focus-visible {
  scale: 1.18;
  translate: 0 -2px;
  box-shadow:
    0 10px 22px rgba(255, 107, 53, 0.6),
    0 0 0 6px rgba(252, 211, 77, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  outline: none;
}

@keyframes pinDrop {
  0% {
    scale: 0.4;
    translate: 0 -18px;
    opacity: 0;
  }
  60% {
    scale: 1.08;
    translate: 0 0;
    opacity: 1;
  }
  100% {
    scale: 1;
    translate: 0 0;
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .taco-pin {
    animation: none;
    transition: none;
  }
}
</style>
