<template>
  <div>
    <!-- Text Field -->
    <v-text-field
      v-if="type === 'text'"
      v-model="localValue"
      :label="label"
      :rules="rules"
      :required="required"
      :disabled="disabled"
      :hint="hint"
      :persistent-hint="!!hint"
    />

    <!-- Textarea -->
    <v-textarea
      v-else-if="type === 'textarea'"
      v-model="localValue"
      :label="label"
      :rules="rules"
      :required="required"
      :disabled="disabled"
      :hint="hint"
      :persistent-hint="!!hint"
      :rows="rows"
    />

    <!-- Select -->
    <v-select
      v-else-if="type === 'select'"
      v-model="localValue"
      :items="items"
      :label="label"
      :rules="rules"
      :required="required"
      :disabled="disabled"
      :hint="hint"
      :persistent-hint="!!hint"
      :item-title="itemTitle"
      :item-value="itemValue"
      :return-object="returnObject"
      :loading="loading"
      :clearable="clearable"
    >
      <template v-if="$slots['no-data']" v-slot:no-data>
        <slot name="no-data"></slot>
      </template>
    </v-select>

    <!-- Switch -->
    <v-switch
      v-else-if="type === 'switch'"
      v-model="localValue"
      :label="label"
      :color="color"
      :disabled="disabled"
      :hint="hint"
      :persistent-hint="!!hint"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';

// Define types for validation rules to fix linter errors
type ValidationRule = (value: any) => boolean | string;

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object, Array],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value: string) => ['text', 'textarea', 'select', 'switch'].includes(value)
  },
  label: {
    type: String,
    required: true
  },
  rules: {
    type: Array as () => ValidationRule[],
    default: () => []
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hint: {
    type: String,
    default: ''
  },
  // For textarea
  rows: {
    type: [String, Number],
    default: 3
  },
  // For select
  items: {
    type: Array,
    default: () => []
  },
  itemTitle: {
    type: String,
    default: 'title'
  },
  itemValue: {
    type: String,
    default: 'value'
  },
  returnObject: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  },
  // For switch
  color: {
    type: String,
    default: 'primary'
  }
});

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script> 