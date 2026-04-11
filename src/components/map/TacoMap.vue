<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import { shallowRef, watch, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/mapStore'
import { useGeolocation } from '@/composables/useGeolocation'
import type { YelpBusiness } from '@/types/yelp'

const mapStore = useMapStore()
const { getLocation } = useGeolocation()

const map = shallowRef<mapboxgl.Map | null>(null)
const markers = shallowRef<mapboxgl.Marker[]>([])

const PORTLAND_LNG = -122.6765
const PORTLAND_LAT = 45.5231

function clearMarkers() {
  markers.value.forEach((marker) => marker.remove())
  markers.value = []
}

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

watch(
  () => mapStore.shops,
  (shops) => {
    if (map.value) {
      addMarkers(shops)
    }
  },
  { deep: true }
)

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

onUnmounted(() => {
  clearMarkers()
  map.value?.remove()
  map.value = null
})
</script>

<template>
  <div id="map" style="width: 100%; height: 100%" />
</template>
