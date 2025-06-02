<template>
  <div 
    class="skeleton-loader"
    :class="[`skeleton-loader--${type}`, { 'skeleton-loader--dark': dark }]"
  >
    <!-- Card Skeleton -->
    <template v-if="type === 'card'">
      <div class="skeleton-loader__item skeleton-loader__header"></div>
      <div class="skeleton-loader__item skeleton-loader__title"></div>
      <div class="skeleton-loader__item skeleton-loader__text" v-for="i in linesCount" :key="i"></div>
      <div class="skeleton-loader__item skeleton-loader__button" v-if="showButton"></div>
    </template>

    <!-- Table Skeleton -->
    <template v-else-if="type === 'table'">
      <div class="skeleton-loader__table-header">
        <div class="skeleton-loader__item" v-for="i in columnsCount" :key="i"></div>
      </div>
      <div class="skeleton-loader__table-row" v-for="i in rowsCount" :key="i">
        <div class="skeleton-loader__item" v-for="j in columnsCount" :key="j"></div>
      </div>
    </template>

    <!-- List Skeleton -->
    <template v-else-if="type === 'list'">
      <div 
        class="skeleton-loader__list-item" 
        v-for="i in itemsCount" 
        :key="i"
      >
        <div class="skeleton-loader__item skeleton-loader__avatar" v-if="withAvatar"></div>
        <div class="skeleton-loader__item-content">
          <div class="skeleton-loader__item skeleton-loader__title"></div>
          <div class="skeleton-loader__item skeleton-loader__text" v-for="j in linesCount" :key="j"></div>
        </div>
      </div>
    </template>

    <!-- Stats Card Skeleton -->
    <template v-else-if="type === 'stats-card'">
      <div class="skeleton-loader__stats-layout">
        <div class="skeleton-loader__item skeleton-loader__icon"></div>
        <div class="skeleton-loader__stats-content">
          <div class="skeleton-loader__item skeleton-loader__subtitle"></div>
          <div class="skeleton-loader__item skeleton-loader__value"></div>
        </div>
      </div>
      <div class="skeleton-loader__item skeleton-loader__footer" v-if="showFooter"></div>
    </template>

    <!-- Form Skeleton -->
    <template v-else-if="type === 'form'">
      <div class="skeleton-loader__form-group" v-for="i in fieldsCount" :key="i">
        <div class="skeleton-loader__item skeleton-loader__label"></div>
        <div class="skeleton-loader__item skeleton-loader__input"></div>
      </div>
      <div class="skeleton-loader__item skeleton-loader__button" v-if="showButton"></div>
    </template>

    <!-- Custom / Default -->
    <template v-else>
      <slot></slot>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps({
  /**
   * Type of skeleton to display
   * @values card, table, list, stats-card, form, custom
   */
  type: {
    type: String,
    default: 'card',
    validator: (value: string) => ['card', 'table', 'list', 'stats-card', 'form', 'custom'].includes(value)
  },
  /**
   * Number of text lines to display (for card and list types)
   */
  linesCount: {
    type: Number,
    default: 3
  },
  /**
   * Number of items to display (for list type)
   */
  itemsCount: {
    type: Number,
    default: 3
  },
  /**
   * Number of rows to display (for table type)
   */
  rowsCount: {
    type: Number,
    default: 5
  },
  /**
   * Number of columns to display (for table type)
   */
  columnsCount: {
    type: Number,
    default: 4
  },
  /**
   * Number of fields to display (for form type)
   */
  fieldsCount: {
    type: Number,
    default: 4
  },
  /**
   * Show avatar in list items
   */
  withAvatar: {
    type: Boolean,
    default: true
  },
  /**
   * Show button in card or form skeleton
   */
  showButton: {
    type: Boolean,
    default: true
  },
  /**
   * Show footer in stats card
   */
  showFooter: {
    type: Boolean,
    default: true
  },
  /**
   * Apply dark variant styling
   */
  dark: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-loader__item {
  background: linear-gradient(90deg, 
    rgba(var(--v-theme-on-surface), 0.06) 25%, 
    rgba(var(--v-theme-on-surface), 0.12) 37%, 
    rgba(var(--v-theme-on-surface), 0.06) 63%
  );
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
  border-radius: 4px;
}

.skeleton-loader--dark .skeleton-loader__item {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.12) 25%, 
    rgba(255, 255, 255, 0.2) 37%, 
    rgba(255, 255, 255, 0.12) 63%
  );
  background-size: 400% 100%;
}

/* Card skeleton styles */
.skeleton-loader--card .skeleton-loader__header {
  height: 200px;
  margin-bottom: 16px;
}

.skeleton-loader--card .skeleton-loader__title {
  height: 24px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-loader--card .skeleton-loader__text {
  height: 16px;
  margin-bottom: 12px;
}

.skeleton-loader--card .skeleton-loader__text:nth-child(2) {
  width: 90%;
}

.skeleton-loader--card .skeleton-loader__text:nth-child(3) {
  width: 80%;
}

.skeleton-loader--card .skeleton-loader__text:nth-child(n+4) {
  width: 85%;
}

.skeleton-loader--card .skeleton-loader__button {
  height: 40px;
  width: 120px;
  margin-top: 8px;
}

/* List skeleton styles */
.skeleton-loader--list .skeleton-loader__list-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.skeleton-loader--list .skeleton-loader__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 16px;
  flex-shrink: 0;
}

.skeleton-loader--list .skeleton-loader__item-content {
  flex-grow: 1;
}

.skeleton-loader--list .skeleton-loader__title {
  height: 20px;
  width: 50%;
  margin-bottom: 8px;
}

.skeleton-loader--list .skeleton-loader__text {
  height: 14px;
  margin-bottom: 8px;
}

.skeleton-loader--list .skeleton-loader__text:nth-child(2) {
  width: 90%;
}

.skeleton-loader--list .skeleton-loader__text:nth-child(n+3) {
  width: 75%;
}

/* Table skeleton styles */
.skeleton-loader--table .skeleton-loader__table-header {
  display: flex;
  margin-bottom: 16px;
}

.skeleton-loader--table .skeleton-loader__table-header .skeleton-loader__item {
  height: 24px;
  flex: 1;
  margin-right: 16px;
}

.skeleton-loader--table .skeleton-loader__table-row {
  display: flex;
  margin-bottom: 12px;
}

.skeleton-loader--table .skeleton-loader__table-row .skeleton-loader__item {
  height: 20px;
  flex: 1;
  margin-right: 16px;
}

/* Stats Card skeleton styles */
.skeleton-loader--stats-card .skeleton-loader__stats-layout {
  display: flex;
  margin-bottom: 16px;
}

.skeleton-loader--stats-card .skeleton-loader__icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  margin-right: 16px;
}

.skeleton-loader--stats-card .skeleton-loader__stats-content {
  flex-grow: 1;
}

.skeleton-loader--stats-card .skeleton-loader__subtitle {
  height: 16px;
  width: 80%;
  margin-bottom: 12px;
}

.skeleton-loader--stats-card .skeleton-loader__value {
  height: 28px;
  width: 40%;
}

.skeleton-loader--stats-card .skeleton-loader__footer {
  height: 40px;
  margin-top: 16px;
}

/* Form skeleton styles */
.skeleton-loader--form .skeleton-loader__form-group {
  margin-bottom: 20px;
}

.skeleton-loader--form .skeleton-loader__label {
  height: 16px;
  width: 120px;
  margin-bottom: 8px;
}

.skeleton-loader--form .skeleton-loader__input {
  height: 40px;
  width: 100%;
}

.skeleton-loader--form .skeleton-loader__button {
  height: 40px;
  width: 120px;
  margin-top: 16px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style> 