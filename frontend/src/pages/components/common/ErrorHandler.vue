<template>
  <v-snackbar
    v-model="show"
    :color="type"
    :timeout="timeout"
    location="top"
  >
    {{ message }}

    <template v-slot:actions>
      <v-btn
        color="white"
        variant="text"
        @click="show = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useErrorStore } from '@/utils/stores/common/errorStore';
import type { Store } from 'pinia';

interface ErrorState {
  error: {
    message: string;
    type?: 'error' | 'warning' | 'info' | 'success';
  } | null;
}

const errorStore = useErrorStore();
const show = ref(false);
const message = ref('');
const type = ref('error');
const timeout = ref(5000);

// Subscribe to error store changes
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = errorStore.$subscribe((mutation: { type: string }, state: ErrorState) => {
    if (state.error) {
      message.value = state.error.message;
      type.value = state.error.type || 'error';
      show.value = true;
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script> 