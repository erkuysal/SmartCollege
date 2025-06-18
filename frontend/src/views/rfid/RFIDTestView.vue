<template>
  <v-container class="rfid-test-view">
    <v-row>
      <v-col cols="12">
        <h1 class="header-title mb-4">RFID Scanner Test</h1>
      </v-col>
    </v-row>

    <!-- Single Scan Section -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Single Scan Test</v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-4">
              <v-btn
                color="primary"
                :loading="isReading"
                :disabled="isReading"
                @click="handleSingleScan"
              >
                Scan RFID Card
              </v-btn>

              <div v-if="lastReadStudentNumber" class="scan-result">
                <div class="text-subtitle-1">Last Scan Result:</div>
                <div class="text-body-1">Student Number: {{ lastReadStudentNumber }}</div>
                <div v-if="lastScanDetails" class="text-body-2">
                  <div>UID: {{ lastScanDetails.uid }}</div>
                  <div>Message: {{ lastScanDetails.message }}</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Continuous Scan Section -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Continuous Scan Test</v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-4">
              <v-btn
                :color="isContinuousScanning ? 'error' : 'primary'"
                :loading="isContinuousScanning"
                @click="toggleContinuousScan"
              >
                {{ isContinuousScanning ? 'Stop Scanning' : 'Start Continuous Scan' }}
              </v-btn>

              <div v-if="scannedStudents.length > 0" class="scan-results">
                <div class="text-subtitle-1 mb-2">Scanned Students:</div>
                <v-list>
                  <v-list-item
                    v-for="(student, index) in scannedStudents"
                    :key="index"
                    :title="student.student_number"
                    :subtitle="formatDate(student.timestamp)"
                  >
                    <template v-slot:prepend>
                      <v-icon color="success" icon="mdi-check-circle" />
                    </template>
                    <template v-slot:append>
                      <div class="text-caption">
                        <div>UID: {{ student.uid }}</div>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Real-time Popup for Continuous Scan -->
    <v-dialog v-model="isContinuousScanning" max-width="500px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Continuous Scan - Real-time Results</span>
          <v-btn icon @click="stopContinuousScan" color="error">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="scannedStudents.length === 0" class="text-center text-grey">No cards scanned yet...</div>
          <v-list v-else>
            <v-list-item
              v-for="(student, index) in scannedStudents"
              :key="index"
              :title="student.student_number"
              :subtitle="formatDate(student.timestamp)"
            >
              <template v-slot:prepend>
                <v-icon color="success" icon="mdi-check-circle" />
              </template>
              <template v-slot:append>
                <div class="text-caption">
                  <div>UID: {{ student.uid }}</div>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" @click="stopContinuousScan">Stop Scanning</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Alert -->
    <v-row>
      <v-col cols="12">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          {{ error }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';
import { useRfidStore } from '@/client/stores/rfid.ts';
import type { ScannedStudent } from '@/client/stores/rfid.ts';

const rfidStore = useRfidStore();
const error = ref('');

// Computed properties from store
const isReading = ref(false);
const isContinuousScanning = ref(false);
const lastReadStudentNumber = ref<string | null>(null);
const lastScanDetails = ref<ScannedStudent | null>(null);
const scannedStudents = ref<ScannedStudent[]>([]);

// Watch store state changes
watch(() => rfidStore.isReading, (newValue: boolean) => {
  isReading.value = newValue;
});

watch(() => rfidStore.isContinuousScanning, (newValue: boolean) => {
  isContinuousScanning.value = newValue;
});

watch(() => rfidStore.lastReadStudentNumber, (newValue: string | null) => {
  lastReadStudentNumber.value = newValue;
});

watch(() => rfidStore.scannedStudents, (newValue: ScannedStudent[]) => {
  scannedStudents.value = newValue;
  if (newValue.length > 0) {
    lastScanDetails.value = newValue[newValue.length - 1];
  }
});

watch(() => rfidStore.error, (newValue: string) => {
  error.value = newValue;
});

// Methods
const handleSingleScan = async () => {
  try {
    error.value = '';
    await rfidStore.scanRFID();
  } catch (e: any) {
    error.value = e.message || 'Failed to scan RFID card';
  }
};

const toggleContinuousScan = async () => {
  try {
    error.value = '';
    if (isContinuousScanning.value) {
      await rfidStore.stopContinuousScan();
    } else {
      await rfidStore.startContinuousScan();
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to toggle continuous scanning';
  }
};

const stopContinuousScan = async () => {
  try {
    error.value = '';
    await rfidStore.stopContinuousScan();
  } catch (e: any) {
    error.value = e.message || 'Failed to stop continuous scanning';
  }
};

const formatDate = (dt: string) => {
  if (!dt) return '';
  return new Date(dt).toLocaleString();
};

// Cleanup on component unmount
onUnmounted(() => {
  if (isContinuousScanning.value) {
    rfidStore.stopContinuousScan();
  }
  rfidStore.resetState();
});
</script>

<style lang="scss">
@use '../../styles/theme/index' as theme;

.rfid-test-view {
  padding: theme.$spacing-xl;
  background-color: theme.$theme-surface-0;
  min-height: 100vh;
}

.header-title {
  color: theme.$theme-text-primary;
  font-size: theme.$font-size-2xl;
  font-weight: theme.$font-weight-bold;
  margin-bottom: theme.$spacing-lg;
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

.v-card-text {
  color: theme.$theme-text-secondary;
}

.v-alert {
  margin-top: theme.$spacing-lg;
  border-radius: theme.$border-radius-md;
}

.text-caption {
  color: theme.$theme-text-secondary;
  font-size: theme.$font-size-xs;
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
</style>
