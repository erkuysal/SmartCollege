<template>
  <v-container class="attendance-view">
    <PageHeader title="Attendance Records">
      <template #subtitle>
        View and manage student attendance records
      </template>
    </PageHeader>

    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="header-title">Attendance Records</h1>
          <Filter :filters="filters" @change="handleFilterChange" />
        </div>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>Records</v-card-title>
      <v-card-text>
        <!-- Loading State -->
        <v-progress-circular
          v-if="isLoading"
          indeterminate
          color="primary"
          class="mt-4"
        />

        <!-- Records Grid -->
        <template v-else>
          <v-row>
            <v-col
              v-for="record in attendance"
              :key="record.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card>
                <v-card-item>
                  <template v-slot:prepend>
                    <v-avatar color="primary" size="40">
                      {{ record.student?.first_name?.charAt(0) }}{{ record.student?.last_name?.charAt(0) }}
                    </v-avatar>
                  </template>
                  <v-card-title>
                    {{ record.student?.first_name }} {{ record.student?.last_name }}
                  </v-card-title>
                  <v-card-subtitle>
                    {{ record.student?.student_number }}
                  </v-card-subtitle>
                  <template v-slot:append>
                    <div class="text-caption">
                      {{ formatDate(record.timestamp) }}
                    </div>
                  </template>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <div class="d-flex justify-center mt-4" v-if="totalCount > 0">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(totalCount / pageSize)"
              @update:model-value="handlePageChange"
            />
          </div>

          <!-- Empty State -->
          <v-alert
            v-if="!isLoading && attendance.length === 0"
            type="info"
            variant="tonal"
            class="mt-4"
          >
            No attendance records found.
          </v-alert>
        </template>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mt-4"
    >
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAttendanceStore } from '@/client/stores/attendance.ts';
import type { AttendanceRecord } from '@/client/api.ts';
import Filter from '@/components/common/Filter.vue';
import PageHeader from '@/components/common/PageHeader.vue';

const attendanceStore = useAttendanceStore();
const attendance = ref<AttendanceRecord[]>([]);
const filterDate = ref('');
const error = ref('');
const isLoading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

const filters = ref<{ type: 'search' | 'select'; label: string; value: any; items?: any[]; inputType?: string }[]>([
  {
    type: 'search',
    label: 'Filter by date',
    value: filterDate.value,
    inputType: 'date'
  }
]);

watch(filterDate, () => {
  filters.value[0].value = filterDate.value;
});

function handleFilterChange(values: any[]) {
  filterDate.value = values[0];
  handleFilter();
}

const fetchAttendance = async (date?: string) => {
  isLoading.value = true;
  error.value = '';
  try {
    const params = {
      timestamp_date: date,
      page: currentPage.value,
      page_size: pageSize.value
    };
    await attendanceStore.fetchRecords(params);
    attendance.value = attendanceStore.records;
    totalCount.value = attendanceStore.totalCount;
  } catch (e: any) {
    error.value = e.message || 'Failed to load attendance records.';
    console.error('Error fetching attendance records:', e);
  } finally {
    isLoading.value = false;
  }
};

const handleFilter = async () => {
  currentPage.value = 1;
  await fetchAttendance(filterDate.value);
};

const handlePageChange = async (page: number) => {
  currentPage.value = page;
  await fetchAttendance(filterDate.value);
};

const formatDate = (dt: string) => {
  if (!dt) return '';
  return new Date(dt).toLocaleString();
};

onMounted(() => fetchAttendance());
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.attendance-view {
  padding: theme.$spacing-xl;
  background-color: theme.$theme-surface-0;
  min-height: 100vh;
}

.header {
  margin-bottom: theme.$spacing-xl;

  h1 {
    margin-bottom: theme.$spacing-lg;
    color: theme.$theme-text-primary;
    font-size: theme.$font-size-2xl;
    font-weight: theme.$font-weight-bold;
  }
}

.filter-form {
  margin-bottom: theme.$spacing-xl;
}

.form-group {
  display: flex;
  gap: theme.$spacing-md;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    .btn {
      width: 100%;
    }
  }
}

.v-card {
  background: theme.$theme-surface-1;
  color: theme.$theme-text-primary;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 2px 8px theme.$theme-shadow-color;
}

.v-card-title {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-lg;
  font-weight: theme.$font-weight-semibold;
}

.v-card-subtitle {
  color: theme.$theme-text-secondary;
  font-size: theme.$font-size-sm;
}

.v-card-text {
  color: theme.$theme-text-secondary;
}

.v-alert {
  margin-top: theme.$spacing-lg;
  border-radius: theme.$border-radius-md;
}

.v-avatar {
  background: theme.$theme-primary;
  color: theme.$theme-primary-contrast;
  font-weight: theme.$font-weight-bold;
}

.text-caption {
  color: theme.$theme-text-secondary;
  font-size: theme.$font-size-xs;
}

.d-flex {
  display: flex;
}

.align-center {
  align-items: center;
}

.justify-space-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.mb-4 {
  margin-bottom: theme.$spacing-lg;
}

.mt-4 {
  margin-top: theme.$spacing-lg;
}

.gap-4 {
  gap: theme.$spacing-lg;
}

.header-title {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-2xl;
  font-weight: theme.$font-weight-bold;
  margin-bottom: theme.$spacing-lg;
}
</style>
