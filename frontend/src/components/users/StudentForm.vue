<template>
  <v-form @submit.prevent="handleSubmit" ref="form">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.first_name"
          label="First Name"
          :rules="[v => !!v || 'First name is required']"
          required
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.last_name"
          label="Last Name"
          :rules="[v => !!v || 'Last name is required']"
          required
          variant="outlined"
          density="comfortable"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.student_number"
          label="Student Number"
          :rules="[v => !!v || 'Student number is required']"
          required
          variant="outlined"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="formData.email"
          label="Email"
          type="email"
          :rules="[
            v => !!v || 'Email is required',
            v => /.+@.+\..+/.test(v) || 'Email must be valid'
          ]"
          required
          variant="outlined"
          density="comfortable"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="formData.face_encoding"
          label="Face Encoding"
          :rules="[v => !!v || 'Face encoding is required']"
          required
          variant="outlined"
          density="comfortable"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" class="d-flex justify-end gap-2">
        <v-btn
          color="secondary"
          variant="text"
          @click="$emit('cancel')"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="loading"
        >
          {{ submitText }}
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps<{
  initialData?: {
    first_name: string;
    last_name: string;
    student_number: string;
    email: string;
    face_encoding: string;
  };
  loading?: boolean;
  submitText?: string;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const form = ref();
const formData = reactive({
  first_name: props.initialData?.first_name || '',
  last_name: props.initialData?.last_name || '',
  student_number: props.initialData?.student_number || '',
  email: props.initialData?.email || '',
  face_encoding: props.initialData?.face_encoding || ''
});

const handleSubmit = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    emit('submit', { ...formData });
  }
};
</script>

<style lang="scss" scoped>
@use '../../styles/theme/index' as theme;

.v-form {
  padding: theme.$spacing-lg;
  background: theme.$theme-surface-1;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 2px 8px theme.$theme-shadow-color;
}

.v-row + .v-row {
  margin-top: theme.$spacing-md;
}

.v-col {
  margin-bottom: theme.$spacing-sm;
}

.v-btn {
  min-width: 100px;
  font-weight: theme.$font-weight-medium;
  border-radius: theme.$border-radius-md;
  transition: background theme.$theme-transition-fast;
}

.v-btn[color="primary"] {
  background: theme.$theme-primary;
  color: theme.$theme-primary-contrast;
  &:hover {
    background: theme.$theme-primary-dark;
  }
}

.v-btn[color="secondary"] {
  background: theme.$theme-secondary;
  color: theme.$theme-secondary-contrast;
  &:hover {
    background: theme.$theme-secondary-dark;
  }
}
</style>
