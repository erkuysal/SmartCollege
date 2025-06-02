<template>
  <div class="form-container p-4">
    <v-card class="mx-auto" :max-width="maxWidth">
      <!-- Card Title -->
      <v-card-title class="text-h5 mb-0 pa-4">
        <v-icon v-if="icon" :icon="icon" class="mr-2"></v-icon>
        {{ title }}
      </v-card-title>
      
      <v-divider v-if="showDivider"></v-divider>
      
      <!-- Loading State -->
      <v-progress-circular
        v-if="loading"
        indeterminate
        class="mx-auto d-block my-4"
        :color="loadingColor"
      />
      
      <!-- Form Content -->
      <v-card-text v-else class="pa-4">
        <slot></slot>
      </v-card-text>
      
      <!-- Notification -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        :timeout="snackbarTimeout"
      >
        {{ snackbarText }}
        
        <template v-slot:actions>
          <v-btn
            variant="text"
            icon="mdi-close"
            @click="showSnackbar = false"
          ></v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Define props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: [String, Number],
    default: 800
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingColor: {
    type: String,
    default: 'primary'
  },
  showDivider: {
    type: Boolean,
    default: true
  }
});

// Notification state
const showSnackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('success');
const snackbarTimeout = ref(3000);

// Notification methods
function showNotification(text: string, color: string = 'success', timeout: number = 3000) {
  snackbarText.value = text;
  snackbarColor.value = color;
  snackbarTimeout.value = timeout;
  showSnackbar.value = true;
}

function hideNotification() {
  showSnackbar.value = false;
}

// Expose methods to parent
defineExpose({
  showNotification,
  hideNotification
});
</script>

<style scoped>
.form-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 