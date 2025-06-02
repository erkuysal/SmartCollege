<template>
  <v-row>
    <v-col 
      v-for="(field, index) in fields" 
      :key="index" 
      :cols="field.cols || 12" 
      :md="field.md || 6"
      :sm="field.sm || 12"
    >
      <slot :name="`field-${index}`" :field="field">
        <form-field
          v-model="formData[field.name]" 
          :type="field.type || 'text'"
          :label="field.label"
          :rules="field.rules || []"
          :required="field.required || false"
          :disabled="field.disabled || false"
          :hint="field.hint || ''"
          :items="field.items || []"
          :item-title="field.itemTitle || 'title'"
          :item-value="field.itemValue || 'value'"
          :return-object="field.returnObject || false"
          :loading="field.loading || false"
          :clearable="field.clearable || false"
          :color="field.color || 'primary'"
          :rows="field.rows || 3"
        >
          <template v-if="field.type === 'select' && field.noDataText" #no-data>
            <div class="pa-2">{{ field.noDataText }}</div>
          </template>
        </form-field>
      </slot>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import type { PropType } from 'vue';
import FormField from './FormField.vue';

// Define the field interface
interface FormFieldDefinition {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'switch';
  cols?: number;
  md?: number;
  sm?: number;
  rules?: ((value: any) => boolean | string)[];
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  // Select specific props
  items?: any[];
  itemTitle?: string;
  itemValue?: string;
  returnObject?: boolean;
  loading?: boolean;
  clearable?: boolean;
  noDataText?: string;
  // Switch specific props
  color?: string;
  // Textarea specific props
  rows?: number;
}

const props = defineProps({
  fields: {
    type: Array as PropType<FormFieldDefinition[]>,
    required: true
  },
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script> 