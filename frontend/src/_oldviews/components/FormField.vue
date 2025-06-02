<template>
  <div>
    <!-- Text Field -->
    <v-text-field
      v-if="type === 'text' || type === 'number' || type === 'email' || type === 'password'"
      v-model="modelValue"
      :label="label"
      :placeholder="placeholder"
      :hint="hint"
      :persistent-hint="!!hint"
      :rules="rules"
      :type="type"
      :prepend-inner-icon="prependIcon"
      :append-inner-icon="appendIcon"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :loading="loading"
      :density="density"
      :clearable="clearable"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <!-- Select -->
    <v-select
      v-else-if="type === 'select'"
      v-model="modelValue"
      :items="items"
      :label="label"
      :placeholder="placeholder"
      :hint="hint"
      :persistent-hint="!!hint"
      :rules="rules"
      :item-title="itemTitle"
      :item-value="itemValue"
      :prepend-inner-icon="prependIcon"
      :append-inner-icon="appendIcon"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :loading="loading"
      :density="density"
      :clearable="clearable"
      :return-object="returnObject"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template v-if="$slots['no-data']" v-slot:no-data>
        <slot name="no-data"></slot>
      </template>
    </v-select>

    <!-- Textarea -->
    <v-textarea
      v-else-if="type === 'textarea'"
      v-model="modelValue"
      :label="label"
      :placeholder="placeholder"
      :hint="hint"
      :persistent-hint="!!hint"
      :rules="rules"
      :rows="rows"
      :prepend-inner-icon="prependIcon"
      :append-inner-icon="appendIcon"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :loading="loading"
      :density="density"
      :clearable="clearable"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Define validation rule type
type ValidationRule = (value: any) => boolean | string;
// Define density type
type Density = 'default' | 'comfortable' | 'compact' | undefined;

const props = defineProps({
  modelValue: {
    type: [String, Number, Object, Array, Boolean],
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value: string) => ['text', 'number', 'email', 'password', 'select', 'textarea'].includes(value)
  },
  placeholder: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  rules: {
    type: Array as () => ValidationRule[],
    default: () => []
  },
  prependIcon: {
    type: String,
    default: ''
  },
  appendIcon: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  density: {
    type: String as () => Density,
    default: 'comfortable' as Density
  },
  clearable: {
    type: Boolean,
    default: false
  },
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
  rows: {
    type: [String, Number],
    default: 3
  }
});

defineEmits(['update:modelValue']);
</script> 