<template>
  <div class="table-container" role="table" aria-label="Data Table">
    <div class="table-inner">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="header in computedHeaders"
                :key="getHeaderKey(header)"
                @click="handleSort(header)"
                :class="[{ 'sortable': isSortable(header) }, getHeaderTitle(header) === 'Actions' ? 'text-right' : '']"
                role="columnheader">
              <div class="header-content">
                {{ getHeaderTitle(header) }}
                <span v-if="isSortable(header)" class="sort-icon">
                  <v-icon v-if="sortColumn === getHeaderKey(header)" :icon="sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'" size="small"></v-icon>
                  <v-icon v-else icon="mdi-unfold-more-horizontal" size="small"></v-icon>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in paginatedRows"
              :key="idx"
              :class="{
                'danger-item': row.overdue,
                'selected': selectedRows.includes(idx)
              }"
              @click="handleRowClick(idx)"
              role="row">
            <td v-for="header in computedHeaders"
                :key="getHeaderKey(header)"
                role="cell">
              <template v-if="getHeaderTitle(header) === 'Actions' && props.showActions">
                <div class="actions-dropdown">
                  <button
                    type="button"
                    class="dropdown-toggle"
                    @click.stop="openDropdownAt(idx, $event)"
                    :aria-expanded="openDropdown === idx ? 'true' : 'false'"
                    :aria-label="`Actions for row ${idx + 1}`"
                    @keydown.down.prevent="focusFirstDropdownItem(idx)"
                  >
                    <v-icon icon="mdi-menu" size="small"></v-icon>
                  </button>
                  <teleport to="body">
                    <div
                      v-if="openDropdown === idx && dropdownPosition"
                      class="dropdown-menu floating"
                      :style="{
                        position: 'absolute',
                        top: dropdownPosition.top + 'px',
                        left: dropdownPosition.left + 'px',
                        minWidth: dropdownPosition.width + 'px',
                        zIndex: 9999,
                      }"
                      role="menu"
                      @keydown.esc="closeDropdown"
                    >
                      <div
                        v-for="(action, aIdx) in actions"
                        :key="aIdx"
                        class="dropdown-item"
                        :class="{ 'disabled': action.disabled }"
                        role="menuitem"
                        tabindex="0"
                        @click="!action.disabled && handleActionCustom(action, row, idx)"
                        @keydown.enter.prevent="!action.disabled && handleActionCustom(action, row, idx)"
                      >
                        <div class="dropdown-item-content">
                          <v-icon
                            v-if="action.icon"
                            :icon="action.icon"
                            :color="action.color || 'primary'"
                            size="small"
                            class="dropdown-item-icon"
                          ></v-icon>
                          <span class="dropdown-item-label">{{ action.label }}</span>
                          <span v-if="action.shortcut" class="dropdown-item-shortcut">{{ action.shortcut }}</span>
                        </div>
                      </div>
                      <div v-if="!actions.length" class="dropdown-item disabled" role="menuitem" tabindex="-1">
                        No actions available
                      </div>
                    </div>
                  </teleport>
                </div>
              </template>
              <template v-else>
                <slot
                  :name="`item-${getHeaderKey(header)}`"
                  :row="row"
                >
                  <div class="cell-content">
                    <div class="cell-title">{{ row[getHeaderKey(header)] }}</div>
                  </div>
                </slot>
              </template>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="totalPages > 1">
          <tr>
            <td :colspan="computedHeaders.length">
              <div class="pagination">
                <v-pagination
                  v-model="currentPage"
                  :length="totalPages"
                  :total-visible="7"
                  rounded="circle"
                ></v-pagination>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';

// Support both string and object headers
export type TableHeader = string | { title: string; key: string; sortable?: boolean };

function getHeaderTitle(header: TableHeader): string {
  return typeof header === 'string' ? header : header.title;
}
function getHeaderKey(header: TableHeader): string {
  return typeof header === 'string' ? headerKey(header) : header.key;
}

interface Action {
  label: string;
  handler: (row: any) => void;
  icon?: string;
  color?: string;
  disabled?: boolean;
  shortcut?: string;
}

interface Props {
  headers: TableHeader[];
  rows: any[];
  showActions?: boolean;
  actions?: Action[];
  loading?: boolean;
  itemsPerPage?: number;
  sortableColumns?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  actions: () => [],
  loading: false,
  itemsPerPage: 10,
  sortableColumns: () => []
});

const emit = defineEmits<{
  (e: 'rowClick', row: any, index: number): void;
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void;
}>();

const openDropdown = ref<number | null>(null);
const currentPage = ref(1);
const selectedRows = ref<number[]>([]);
const sortColumn = ref<string>('');
const sortDirection = ref<'asc' | 'desc'>('asc');
const dropdownPosition = ref<{ top: number; left: number; width: number } | null>(null);

const totalPages = computed(() => Math.ceil(props.rows.length / props.itemsPerPage));

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return props.rows.slice(start, end);
});

// Compute headers, always as objects for easier handling
const computedHeaders = computed(() => {
  let baseHeaders = props.headers.slice();
  if (props.showActions) {
    baseHeaders = [...baseHeaders, { title: 'Actions', key: 'Actions' }];
  }
  return baseHeaders;
});

function isSortable(header: TableHeader): boolean {
  if (typeof header === 'string') {
    return props.sortableColumns.includes(header);
  } else {
    return !!header.sortable;
  }
}

function getSortIcon(header: TableHeader): string {
  const key = getHeaderKey(header);
  if (sortColumn.value !== key) return '↕';
  return sortDirection.value === 'asc' ? '↑' : '↓';
}

function handleSort(header: TableHeader) {
  if (!isSortable(header)) return;
  const key = getHeaderKey(header);
  if (sortColumn.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = key;
    sortDirection.value = 'asc';
  }
  emit('sort', key, sortDirection.value);
}

function handleRowClick(idx: number) {
  const index = selectedRows.value.indexOf(idx);
  if (index === -1) {
    selectedRows.value.push(idx);
  } else {
    selectedRows.value.splice(index, 1);
  }
  emit('rowClick', props.rows[idx], idx);
}

function openDropdownAt(idx: number, event: MouseEvent) {
  if (openDropdown.value === idx) {
    closeDropdown();
    return;
  }
  const button = event.currentTarget as HTMLElement;
  const rect = button.getBoundingClientRect();
  dropdownPosition.value = {
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
  };
  openDropdown.value = idx;
}

function closeDropdown() {
  openDropdown.value = null;
  dropdownPosition.value = null;
}

function handleActionCustom(action: Action, row: any, idx: number) {
  if (typeof action.handler === 'function') {
    action.handler(row);
  }
  closeDropdown();
}

function handleClickOutside(event: MouseEvent) {
  // Only close if click is outside any floating dropdown-menu
  const menus = document.querySelectorAll('.dropdown-menu.floating');
  let inside = false;
  menus.forEach(menu => {
    if (menu.contains(event.target as Node)) inside = true;
  });
  if (!inside) closeDropdown();
}

function focusFirstDropdownItem(idx: number) {
  nextTick(() => {
    const menu = document.querySelector('.dropdown-menu.floating[style*="z-index: 9999"]');
    if (menu) {
      const firstItem = menu.querySelector('.dropdown-item:not(.disabled)') as HTMLElement;
      if (firstItem) firstItem.focus();
    }
  });
}

function headerKey(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+$/, '')
    .replace(/_+/, '_');
}

function getStatusColor(statusClass: string): string {
  const colorMap: Record<string, string> = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
    default: 'grey'
  };
  return colorMap[statusClass] || colorMap.default;
}

// Add this computed property to handle menu state
const isMenuOpen = computed({
  get: () => openDropdown.value !== null,
  set: (value) => {
    if (!value) openDropdown.value = null;
  }
});

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
@use '../../styles/theme/index' as theme;

.table-container {
  position: relative;
  background: theme.$theme-surface-1;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 4px 16px theme.$theme-shadow-color;
  overflow: hidden;
  animation: fadeIn 0.3s ease;
}

.table-inner {
  position: relative;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  th, td {
    padding: theme.$spacing-md theme.$spacing-lg;
    text-align: left;
    border-bottom: 1px solid theme.$theme-border-light;
  }

  th {
    background: theme.$theme-surface-2;
    font-weight: theme.$font-weight-semibold;
    color: theme.$theme-text-secondary;
    white-space: nowrap;
    
    &.sortable {
      cursor: pointer;
      user-select: none;
      
      &:hover {
        background: theme.$theme-surface-3;
      }
    }
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: theme.$spacing-xs;
  }

  tr {
    transition: all 0.2s ease;
    
    &:hover {
      background: theme.$theme-surface-2;
    }
    
    &.selected {
      background: theme.$theme-primary-light;
    }
    
    &.danger-item {
      background: theme.$theme-error-light;
    }
  }
}

.cell-content {
  display: flex;
  align-items: center;
  gap: theme.$spacing-sm;
  padding: theme.$spacing-xs 0;
}

.cell-icon {
  color: theme.$theme-text-secondary;
}

.cell-text {
  display: flex;
  flex-direction: column;
}

.cell-title {
  font-weight: theme.$font-weight-medium;
  color: theme.$theme-text-primary;
}

.cell-subtitle {
  font-size: theme.$font-size-sm;
  color: theme.$theme-text-secondary;
}

.cell-overdue {
  display: flex;
  align-items: center;
  gap: theme.$spacing-xs;
  color: theme.$theme-error;
  font-size: theme.$font-size-sm;
}

.cell-status {
  display: flex;
  align-items: center;
}

.status-chip {
  font-size: theme.$font-size-sm;
  font-weight: theme.$font-weight-medium;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(theme.$theme-surface-1, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  backdrop-filter: blur(4px);
  
  .v-progress-circular {
    opacity: 0.8;
  }
}

.pagination {
  padding: theme.$spacing-md;
  display: flex;
  justify-content: center;
  background: theme.$theme-surface-2;
}

.actions-dropdown {
  position: relative;
  display: inline-block;
  z-index: 20;
}

.dropdown-toggle {
  background: theme.$theme-surface-1;
  color: theme.$theme-text-primary;
  border: 1px solid theme.$theme-border-light;
  border-radius: theme.$border-radius-md;
  padding: theme.$spacing-sm;
  font-size: theme.$font-size-base;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 36px;
  height: 36px;

  &:hover, &:focus {
    border-color: theme.$theme-primary;
    background: theme.$theme-surface-2;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
}

.dropdown-menu.floating {
  position: absolute;
  background: theme.$theme-surface-2;
  border: 1px solid theme.$theme-border-light;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  padding: theme.$spacing-sm 0;
  margin: 8px 0 0 0;
  list-style: none;
  animation: dropdown-fade-in 0.2s cubic-bezier(.4,0,.2,1);
  will-change: opacity, transform;
  min-width: 240px;
  color: theme.$theme-text-primary;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(theme.$theme-border-light, 0.8);
}

.dropdown-item {
  padding: theme.$spacing-sm theme.$spacing-lg;
  cursor: pointer;
  font-size: theme.$font-size-base;
  transition: all 0.2s ease;
  outline: none;
  list-style: none;
  position: relative;
  margin: 2px 0;

  &:hover:not(.disabled),
  &:focus:not(.disabled) {
    background: theme.$theme-surface-3;
    transform: translateX(4px);
  }

  &:active:not(.disabled) {
    transform: translateX(2px);
  }

  &.disabled {
    color: theme.$theme-text-secondary;
    cursor: not-allowed;
    opacity: 0.6;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 3px;
    background: theme.$theme-primary;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &:hover:not(.disabled)::before {
    opacity: 1;
  }
}

.dropdown-item-content {
  display: flex;
  align-items: center;
  gap: theme.$spacing-md;
  padding: 2px 0;
}

.dropdown-item-icon {
  flex-shrink: 0;
  font-size: 1.2em;
  opacity: 0.9;
  transition: transform 0.2s ease;

  .dropdown-item:hover & {
    transform: scale(1.1);
  }
}

.dropdown-item-label {
  flex-grow: 1;
  font-weight: theme.$font-weight-medium;
  letter-spacing: 0.01em;
}

.dropdown-item-shortcut {
  font-size: theme.$font-size-sm;
  color: theme.$theme-text-secondary;
  background: theme.$theme-surface-1;
  padding: 4px 8px;
  border-radius: theme.$border-radius-sm;
  transition: all 0.2s ease;
  border: 1px solid theme.$theme-border-light;

  .dropdown-item:hover & {
    background: theme.$theme-surface-2;
    border-color: theme.$theme-border-light;
  }
}

@keyframes dropdown-fade-in {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

// Add a subtle divider between items
.dropdown-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: theme.$spacing-lg;
  right: theme.$spacing-lg;
  height: 1px;
  background: theme.$theme-border-light;
  opacity: 0.5;
}

// Add smooth transitions
.data-table {
  tr {
    transition: all 0.2s ease;
  }
  
  td {
    transition: background-color 0.2s ease;
  }
}

// Improve loading overlay
.loading-overlay {
  backdrop-filter: blur(4px);
  
  .v-progress-circular {
    opacity: 0.8;
  }
}

// Add hover effects for interactive elements
.sortable {
  &:hover {
    .v-icon {
      opacity: 1;
    }
  }
  
  .v-icon {
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }
}

// Improve cell content spacing
.cell-content {
  padding: theme.$spacing-xs 0;
}

// Add subtle animations
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.table-container {
  animation: fadeIn 0.3s ease;
}
</style>
