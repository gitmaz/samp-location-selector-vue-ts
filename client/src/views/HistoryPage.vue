<template>
  <div class="history">
    <div class="toolbar">
      <button type="button" class="btn" :disabled="loading" @click="refresh">
        {{ loading ? 'Loading…' : 'Refresh' }}
      </button>
    </div>
    <p v-if="error" class="err">{{ error }}</p>
    <div v-if="!loading && items.length === 0" class="empty">
      No saved locations yet. Pick a point on the map and save it.
    </div>
    <ul v-else class="list">
      <li v-for="row in items" :key="row.id" class="item">
        <button
          type="button"
          class="del"
          title="Delete"
          :disabled="loading"
          @click="remove(row.id)"
        >
          ×
        </button>
        <div class="addr">{{ row.address }}</div>
        <div class="meta">
          {{ row.latitude.toFixed(6) }}, {{ row.longitude.toFixed(6) }}
          <span class="dot">·</span>
          {{ formatDate(row.created_at) }}
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import type { RootState } from '@/types/store';

const store = useStore<RootState>();

const items = computed(() => store.state.locations.items);
const loading = computed(() => store.state.locations.loading);
const error = computed(() => store.state.locations.error);

function refresh() {
  store.dispatch('locations/fetchAll');
}

function remove(id: number) {
  if (!confirm('Delete this saved location?')) return;
  store.dispatch('locations/deleteById', id);
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-weight: 600;
  cursor: pointer;
  background: #e2e8f0;
  color: #0f172a;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.err {
  margin: 0;
  color: #b91c1c;
}

.empty {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.item {
  position: relative;
  padding: 0.85rem 1rem;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.del {
  position: absolute;
  top: 0.55rem;
  right: 0.6rem;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid #fecaca;
  background: #fff;
  color: #dc2626;
  font-size: 1.15rem;
  line-height: 1;
  font-weight: 800;
  cursor: pointer;
}

.del:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.del:hover:not(:disabled) {
  background: #fee2e2;
}

.addr {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.35rem;
  line-height: 1.35;
}

.meta {
  font-size: 0.85rem;
  color: #64748b;
  font-family: ui-monospace, monospace;
}

.dot {
  margin: 0 0.25rem;
}
</style>
