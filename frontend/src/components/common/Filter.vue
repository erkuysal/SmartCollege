<template>
  <div class="filter-bar">
    <template v-for="(filter, idx) in localFilters" :key="idx">
      <v-text-field
        v-if="filter.type === 'search'"
        v-model="filter.value"
        :placeholder="filter.label"
        :type="filter.inputType || 'text'"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        hide-details
        class="filter-search"
        @input="emitChange"
      />
      <v-select
        v-else-if="filter.type === 'select'"
        v-model="filter.value"
        :items="filter.items"
        :label="filter.label"
        variant="outlined"
        density="comfortable"
        hide-details
        class="filter-select"
        @update:model-value="emitChange"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const props = defineProps<{
  filters: Array<{
    type: 'search' | 'select',
    label: string,
    value: any,
    items?: Array<any>,
    inputType?: string
  }>
}>();

const emit = defineEmits(['change']);

// Local copy to allow v-model binding
const localFilters = reactive(cloneDeep(props.filters));

watch(localFilters, () => {
  emitChange();
}, { deep: true });

function emitChange() {
  emit('change', localFilters.map((f: any) => f.value));
}
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.filter-bar {
  display: flex;
  gap: theme.$spacing-md;
  margin-bottom: theme.$spacing-md;

  // Make all filter fields expand equally
  > * {
    flex: 1 1 0;
    min-width: 180px;
  }
}

.filter-search .v-input__control,
.filter-select .v-input__control {
  background: theme.$theme-surface-2;
  color: theme.$theme-text-primary;
  border-radius: theme.$border-radius-md;
  border: 1px solid theme.$theme-border-light;

  @include theme.theme-dark {
    background: theme.$theme-surface-1;
    color: theme.$theme-text-primary;
    border: 1px solid theme.$theme-border-medium;
  }
}

.filter-search input,
.filter-select input,
.filter-search .v-field__input,
.filter-select .v-field__input {
  background: transparent;
  color: theme.$theme-text-primary;
}

.filter-search .v-label,
.filter-select .v-label {
  color: theme.$theme-text-secondary;
}
</style>
