<template>
  <div class="map-page">
    <p class="hint">
      Click the map to choose a location point. Use <strong>Save location</strong>
      to store the resolved address in the database.
    </p>
    <MapSelector
      :initial-lat="sydney.lat"
      :initial-lng="sydney.lng"
      :initial-zoom="15"
      :saved-locations="items"
      @update:coords="onCoords"
    />
    <div class="panel">
      <div class="addr" v-if="coords">
        <span class="label">Address:</span>
        <span v-if="resolvingAddress">Resolving…</span>
        <span v-else-if="candidateAddress">{{ candidateAddress }}</span>
        <span v-else-if="addressError" class="err-inline">{{ addressError }}</span>
        <span v-else class="muted">—</span>
      </div>
      <div class="coords" v-if="coords">
        <span>{{ coords.lat.toFixed(6) }}, {{ coords.lng.toFixed(6) }}</span>
      </div>
      <button
        type="button"
        class="btn primary"
        :disabled="!coords || saving"
        @click="save"
      >
        {{ saving ? 'Saving…' : 'Save location' }}
      </button>
      <p v-if="error" class="err">{{ error }}</p>
      <p v-if="lastSaved" class="ok">
        Saved: <strong>{{ lastSaved.address }}</strong>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import MapSelector from '../components/MapSelector.vue';
import * as geocodeApi from '../api/geocode';

const sydney = { lat: -33.8688, lng: 151.2093 };

const store = useStore();
const coords = ref<{ lat: number; lng: number } | null>(null);
const candidateAddress = ref<string>('');
const resolvingAddress = ref<boolean>(false);
const addressError = ref<string>('');

const items = computed(() => store.state.locations.items);
const saving = computed(() => store.state.locations.loading);
const error = computed(() => store.state.locations.error);
const lastSaved = computed(() => store.state.locations.lastSaved);

let hideSavedTimer: ReturnType<typeof setTimeout> | null = null;
let requestSeq = 0;

async function onCoords(c: { lat: number; lng: number }) {
  coords.value = c;

  // User is selecting a new candidate, so clear any previous confirmation.
  store.commit('locations/SET_LAST_SAVED', null);
  if (hideSavedTimer) {
    clearTimeout(hideSavedTimer);
    hideSavedTimer = null;
  }

  candidateAddress.value = '';
  addressError.value = '';
  if (!c) return;

  const seq = ++requestSeq;
  resolvingAddress.value = true;
  try {
    const res = await geocodeApi.reverseGeocode({
      latitude: c.lat,
      longitude: c.lng,
    });
    if (seq !== requestSeq) return;
    candidateAddress.value = res.address ?? '';
  } catch (e) {
    if (seq !== requestSeq) return;
    addressError.value = e instanceof Error ? e.message : 'Failed to resolve address';
  } finally {
    if (seq === requestSeq) resolvingAddress.value = false;
  }
}

onMounted(() => {
  store.dispatch('locations/fetchAll');
});

onBeforeUnmount(() => {
  if (hideSavedTimer) clearTimeout(hideSavedTimer);
});

async function save() {
  if (!coords.value) return;
  try {
    await store.dispatch('locations/saveSelection', {
      latitude: coords.value.lat,
      longitude: coords.value.lng,
      address: candidateAddress.value || undefined,
    });

    if (hideSavedTimer) clearTimeout(hideSavedTimer);
    hideSavedTimer = setTimeout(() => {
      store.commit('locations/SET_LAST_SAVED', null);
      hideSavedTimer = null;
    }, 3000);
  } catch {
    /* surfaced via store */
  }
}
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hint {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.45;
}

.panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
}

.addr {
  flex-basis: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.7rem 0.85rem;
  color: #0f172a;
  line-height: 1.35;
}

.label {
  font-weight: 700;
  margin-right: 0.5rem;
}

.muted {
  color: #64748b;
}

.err-inline {
  color: #b91c1c;
}

.coords {
  font-family: ui-monospace, monospace;
  font-size: 0.9rem;
  color: #334155;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  font-weight: 600;
  cursor: pointer;
  background: #e2e8f0;
  color: #0f172a;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn.primary {
  background: #0ea5e9;
  color: #fff;
}

.err {
  margin: 0;
  color: #b91c1c;
  font-size: 0.9rem;
}

.ok {
  margin: 0;
  color: #15803d;
  font-size: 0.9rem;
}
</style>
