<template>
  <v-card class="entity-card">
    <!-- Card Header with Title and Actions -->
    <v-card-item>
      <template v-slot:prepend v-if="showIcon">
        <v-icon :icon="icon" :color="iconColor" size="large"></v-icon>
      </template>
      
      <v-card-title>{{ title }}</v-card-title>
      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
      
      <template v-slot:append v-if="showActions">
        <div>
          <v-btn
            v-if="showEditButton"
            icon="mdi-pencil"
            variant="text"
            density="comfortable"
            :color="editColor"
            @click="$emit('edit')"
          ></v-btn>
          
          <v-btn
            v-if="showDeleteButton"
            icon="mdi-delete"
            variant="text"
            density="comfortable"
            :color="deleteColor"
            @click="$emit('delete')"
          ></v-btn>
          
          <slot name="actions"></slot>
        </div>
      </template>
    </v-card-item>
    
    <v-divider v-if="showDivider"></v-divider>
    
    <!-- Status Badge -->
    <div v-if="status" class="px-4 py-2">
      <v-chip
        :color="statusColor || 'primary'"
        size="small"
        class="text-caption"
      >
        {{ status }}
      </v-chip>
    </div>
    
    <!-- Entity Details -->
    <v-card-text>
      <slot></slot>
    </v-card-text>
    
    <!-- Footer with Extra Actions -->
    <v-card-actions v-if="$slots.footer">
      <slot name="footer"></slot>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
defineProps({
  // Content
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'mdi-information'
  },
  iconColor: {
    type: String,
    default: 'primary'
  },
  
  // Status
  status: {
    type: String,
    default: ''
  },
  statusColor: {
    type: String,
    default: ''
  },
  
  // Display options
  showDivider: {
    type: Boolean,
    default: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showEditButton: {
    type: Boolean,
    default: true
  },
  showDeleteButton: {
    type: Boolean,
    default: true
  },
  
  // Button colors
  editColor: {
    type: String,
    default: 'primary'
  },
  deleteColor: {
    type: String,
    default: 'error'
  }
});

defineEmits(['edit', 'delete']);
</script>

<style scoped>
.entity-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.entity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style> 