<template>
  <v-card :class="cardClass" :max-width="maxWidth">
    <v-card-title class="text-h5 mb-4 pa-4">{{ title }}</v-card-title>
    
    <v-progress-circular 
      v-if="loading" 
      indeterminate 
      class="mx-auto d-block my-4" 
    />
    
    <v-card-text v-else>
      <v-form 
        ref="form" 
        :value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        @submit.prevent="$emit('submit')"
      >
        <slot></slot>
      </v-form>
    </v-card-text>

    <!-- Notification -->
    <v-snackbar
      v-model="snackbarVisible"
      :color="snackbarColor"
      :timeout="snackbarTimeout"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps, defineExpose } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  cardClass: {
    type: String,
    default: 'mx-auto pa-4'
  },
  maxWidth: {
    type: [String, Number],
    default: 800
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  snackbar: {
    type: Object,
    default: () => ({
      show: false,
      text: '',
      color: 'success',
      timeout: 3000
    })
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const form = ref<HTMLFormElement | null>(null);
const snackbarVisible = ref(props.snackbar.show);
const snackbarText = ref(props.snackbar.text);
const snackbarColor = ref(props.snackbar.color);
const snackbarTimeout = ref(props.snackbar.timeout);

// Watch for changes in the snackbar prop
watch(() => props.snackbar, (newVal) => {
  snackbarVisible.value = newVal.show;
  snackbarText.value = newVal.text;
  snackbarColor.value = newVal.color;
  snackbarTimeout.value = newVal.timeout;
}, { deep: true });

// Reset form method
const resetForm = () => {
  form.value?.reset();
};

// Validate form method
const validate = async () => {
  return form.value?.validate() ?? false;
};

// Expose methods to parent component
defineExpose({
  resetForm,
  validate,
  form
});
</script> 