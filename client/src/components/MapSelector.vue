<template>
  <div class="map-wrap">
    <LMap
      :zoom="initialZoom ?? 14"
      :center="[initialLat, initialLng]"
      :use-global-leaflet="false"
      @click="onMapClick"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        :max-zoom="19"
      />

      <LMarker
        v-for="row in savedLocations"
        :key="row.id"
        :lat-lng="[row.latitude, row.longitude]"
        :icon="savedIcon"
      >
        <LPopup>
          {{ row.address }}
        </LPopup>
      </LMarker>

      <LMarker v-if="pendingLatLng" :lat-lng="pendingLatLng" :icon="pendingIcon" />
    </LMap>
  </div>
</template>

<script setup lang="ts">
import type { LocationRow } from '@shared/location';
import { computed, ref } from 'vue';
import { LMap, LMarker, LPopup, LTileLayer } from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';


const props = defineProps<{
  initialLat: number;
  initialLng: number;
  initialZoom?: number;
  savedLocations?: LocationRow[];
}>();

const emit = defineEmits<{
  'update:coords': [payload: { lat: number; lng: number }];
}>();

const savedIcon = L.divIcon({
  className: 'marker marker--saved',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
}) as unknown as L.Icon;

const pendingIcon = L.divIcon({
  className: 'marker marker--pending',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
}) as unknown as L.Icon;

const pendingLatLng = ref<[number, number] | null>(null);

const savedLocations = computed<LocationRow[]>(() => {
  const rows = props.savedLocations ?? [];
  return rows.filter(
    (row) =>
      typeof row.id === 'number' &&
      typeof row.latitude === 'number' &&
      typeof row.longitude === 'number'
  );
});

function onMapClick(e: L.LeafletMouseEvent) {
  const { lat, lng } = e.latlng;
  pendingLatLng.value = [lat, lng];
  emit('update:coords', { lat, lng });
}

</script>

<style scoped>
.map-wrap {
  height: min(60vh, 520px);
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.map-wrap :deep(.leaflet-container) {
  height: 100%;
  width: 100%;
}
</style>

<style>
/* Leaflet markers via divIcon */
.marker {
  border-radius: 999px;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.25);
}
.marker--saved {
  background: #2563eb; /* blue */
}
.marker--pending {
  background: #ef4444; /* red */
}
</style>
