<template>
  <v-card>
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar color="primary" size="40">
          {{ student.first_name.charAt(0) }}{{ student.last_name.charAt(0) }}
        </v-avatar>
      </template>
      <v-card-title>
        {{ student.first_name }} {{ student.last_name }}
      </v-card-title>
      <v-card-subtitle>
        {{ student.student_number }}
      </v-card-subtitle>
      <template v-slot:append>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              v-bind="props"
            />
          </template>
          <v-list>
            <v-list-item
              prepend-icon="mdi-eye"
              title="View Details"
              @click="$emit('view', student)"
            />
            <v-list-item
              prepend-icon="mdi-pencil"
              title="Edit"
              @click="$emit('edit', student)"
            />
            <v-list-item
              prepend-icon="mdi-delete"
              title="Delete"
              @click="$emit('delete', student)"
            />
          </v-list>
        </v-menu>
      </template>
    </v-card-item>
    <v-card-text>
      <div class="text-body-2">
        <v-icon icon="mdi-email" size="small" class="mr-1" />
        {{ student.email }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  student: {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
    email: string;
  };
}>();

defineEmits<{
  (e: 'view', student: any): void;
  (e: 'edit', student: any): void;
  (e: 'delete', student: any): void;
}>();
</script>

<style lang="scss" scoped>
@use '../../styles/theme/index' as theme;

.v-card {
  background: theme.$theme-surface-1;
  border-radius: theme.$border-radius-lg;
  box-shadow: 0 2px 8px theme.$theme-shadow-color;
  transition: box-shadow theme.$theme-transition-fast;
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
  font-size: theme.$font-size-sm;
  padding-top: theme.$spacing-xs;
}

.v-avatar {
  background: theme.$theme-primary;
  color: theme.$theme-primary-contrast;
  font-weight: theme.$font-weight-bold;
}

.v-btn[icon] {
  color: theme.$theme-text-secondary;
  &:hover {
    color: theme.$theme-primary;
  }
}

.v-list-item {
  border-radius: theme.$border-radius-md;
  &:hover {
    background: theme.$theme-surface-2;
  }
}
</style>
