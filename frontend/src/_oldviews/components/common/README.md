# Common Form Components

This directory contains reusable form components that are used across the application.

## Components

### 1. BaseFormCard

A wrapper component that provides a standard card layout for forms with built-in loading state and snackbar notifications.

```vue
<base-form-card
  title="Add New Item"
  v-model="isFormValid"
  :loading="loading"
  :snackbar="{ show: true, text: 'Success!', color: 'success', timeout: 3000 }"
  @submit="onSubmit"
  ref="formRef"
>
  <!-- Form content goes here -->
</base-form-card>
```

### 2. FormActions

A component for rendering consistent form action buttons (submit/cancel).

```vue
<form-actions
  submit-text="Save Changes"
  cancel-text="Go Back"
  :loading="loading"
  :disabled="!isFormValid"
  @cancel="goBack"
/>
```

### 3. FormField

A component that renders different types of form fields with consistent styling and validation.

```vue
<form-field
  v-model="formData.name"
  type="text"
  label="Name"
  :rules="[v => !!v || 'Name is required']"
  required
/>
```

Supported field types:
- `text`: Text input field
- `textarea`: Multi-line text field
- `select`: Dropdown selection
- `switch`: Toggle switch

### 4. FormRow

A component that renders a row of form fields based on field definitions.

```vue
<form-row
  :fields="[
    {
      name: 'first_name',
      label: 'First Name',
      type: 'text',
      required: true,
      rules: [v => !!v || 'First name is required']
    },
    {
      name: 'last_name',
      label: 'Last Name',
      type: 'text',
      required: true,
      rules: [v => !!v || 'Last name is required']
    }
  ]"
  v-model="formData"
/>
```

## Usage

You can import these components individually:

```js
import BaseFormCard from '@/components/common/BaseFormCard.vue'
import FormActions from '@/components/common/FormActions.vue'
```

Or use the named exports from the index file:

```js
import { BaseFormCard, FormActions, FormField, FormRow } from '@/components/common'
```

## Patterns

### Basic Form Pattern

```vue
<template>
  <div class="container p-4">
    <base-form-card
      title="Form Title"
      v-model="isFormValid"
      :loading="loading"
      :snackbar="snackbarConfig"
      @submit="onSubmit"
      ref="formCard"
    >
      <form-row :fields="formFields" v-model="formData" />
      
      <form-actions 
        submit-text="Submit" 
        :loading="loading"
        :disabled="!isFormValid"
        @cancel="router.back()"
      />
    </base-form-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BaseFormCard, FormRow, FormActions } from '@/components/common'

const router = useRouter()
const isFormValid = ref(false)
const loading = ref(false)
const snackbarConfig = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

const formData = ref({
  // form data here
})

const formFields = computed(() => [
  // field definitions here
])

const onSubmit = async () => {
  // form submission logic
}
</script>
``` 