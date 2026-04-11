<script setup lang="ts">
/**
 * TacoMap component.
 *
 * Renders a full-viewport Mapbox GL JS map (dark-v11 style) with 3D building
 * extrusions and custom taco-emoji markers for every taco shop returned by the
 * Yelp proxy. On mount it:
 *   1. Initialises the map centred on Portland, OR (the fallback location).
 *   2. Adds the 3D-buildings fill-extrusion layer once tiles have loaded.
 *   3. Requests the user's geolocation; on success flies to their position and
 *      fetches nearby shops; on failure falls back silently to Portland.
 *
 * Each marker is a keyboard-accessible 32×32 px circular badge containing the
 * taco emoji. Clicking or pressing Enter on a marker calls
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
import type { YelpBusiness } from '@/types/yelp'

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
function addMarkers(shops: YelpBusiness[]) {
  clearMarkers()
  shops.forEach((shop: YelpBusiness) => {
    const el = document.createElement('div')
    el.innerHTML = '🌮'
    el.style.width = '32px'
    el.style.height = '32px'
    el.style.background = 'white'
    el.style.borderRadius = '50%'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.cursor = 'pointer'
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
    el.style.fontSize = '16px'
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
 * Watcher: rebuilds the marker layer whenever the Pinia shop list changes.
 * Uses `deep: true` because `mapStore.shops` is an array that may be replaced
 * in its entirety or mutated in place.
 */
watch(
  () => mapStore.shops,
  (shops) => {
    if (map.value) {
      addMarkers(shops)
    }
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
    style: 'mapbox://styles/mapbox/dark-v11',
    zoom: 13,
    pitch: 45,
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
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-opacity': 0.6,
      },
    })
  })

  getLocation()
    .then(({ lat, lng }) => {
      map.value?.flyTo({ center: [lng, lat], zoom: 13, pitch: 45 })
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
  <div id="map" style="width: 100%; height: 100%" />
</template>
