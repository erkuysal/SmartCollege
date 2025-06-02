<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { PropType } from 'vue';
import { useRouter } from 'vue-router';
import { useAccessibility } from '@/composables/useAccessibility';

// Access accessibility settings
const { reducedMotion } = useAccessibility();
const router = useRouter();

// Define valid sizes, colors, and variants
type ButtonSize = 'x-small' | 'small' | 'default' | 'large' | 'x-large';
type ButtonColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'default';
type ButtonVariant = 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain';

/**
 * Component props
 */
const props = defineProps({
  /**
   * Button label text
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * Button size
   */
  size: {
    type: String as PropType<ButtonSize>,
    default: 'default'
  },
  /**
   * Button color
   */
  color: {
    type: String as PropType<ButtonColor>,
    default: 'primary'
  },
  /**
   * Button variant
   */
  variant: {
    type: String as PropType<ButtonVariant>,
    default: 'elevated'
  },
  /**
   * Button icon (material design icon name)
   */
  icon: {
    type: String,
    default: ''
  },
  /**
   * Icon position (left or right)
   */
  iconPosition: {
    type: String as PropType<'left' | 'right'>,
    default: 'left'
  },
  /**
   * Whether button is disabled
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Whether button is in loading state
   */
  loading: {
    type: Boolean,
    default: false
  },
  /**
   * Whether button should be block level (full width)
   */
  block: {
    type: Boolean,
    default: false
  },
  /**
   * Whether button should be rounded
   */
  rounded: {
    type: String as PropType<'default' | 'pill' | 'shaped' | '0'>,
    default: 'default'
  },
  /**
   * Whether button should have elevation (shadow)
   */
  elevation: {
    type: [Number, String],
    default: undefined
  },
  /**
   * Whether button should have a ripple effect
   */
  ripple: {
    type: Boolean,
    default: true
  },
  /**
   * Additional CSS classes
   */
  class: {
    type: String,
    default: ''
  },
  /**
   * Button type (HTML attribute)
   */
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: 'button'
  },
  /**
   * Button route (for router-link)
   */
  to: {
    type: [String, Object],
    default: undefined
  },
  /**
   * Button href (for a tag)
   */
  href: {
    type: String,
    default: ''
  },
  /**
   * Button target (for a tag)
   */
  target: {
    type: String,
    default: ''
  },
  /**
   * ARIA label
   */
  ariaLabel: {
    type: String,
    default: ''
  }
});

/**
 * Emitted events
 */
const emits = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

/**
 * Computed props for base v-btn component
 */
const buttonProps = computed(() => {
  return {
    type: props.type,
    color: props.color,
    variant: props.variant,
    size: props.size,
    disabled: props.disabled || props.loading,
    loading: props.loading,
    block: props.block,
    rounded: props.rounded,
    elevation: props.elevation,
    ripple: !reducedMotion.value && props.ripple,
    class: [
      'base-button',
      { 'icon-right': props.iconPosition === 'right' },
      props.class
    ],
    'aria-label': props.ariaLabel || props.label,
    'aria-disabled': props.disabled || props.loading ? 'true' : undefined,
    'aria-busy': props.loading ? 'true' : undefined
  };
});

/**
 * Whether to use router-link
 */
const isRouterLink = computed(() => !!props.to);

/**
 * Whether to use anchor tag
 */
const isAnchor = computed(() => !!props.href);

/**
 * Handle button click
 */
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  
  if (isRouterLink.value && props.to) {
    router.push(props.to);
  }
  
  emits('click', event);
};
</script>

<template>
  <!-- Router Link Button -->
  <router-link 
    v-if="isRouterLink && !disabled"
    :to="to"
    custom
    v-slot="{ navigate }"
  >
    <v-btn
      v-bind="buttonProps"
      @click="navigate"
    >
      <v-icon v-if="icon && iconPosition === 'left'" :icon="icon" class="mr-2"></v-icon>
      <span v-if="label">{{ label }}</span>
      <slot></slot>
      <v-icon v-if="icon && iconPosition === 'right'" :icon="icon" class="ml-2"></v-icon>
    </v-btn>
  </router-link>
  
  <!-- Anchor Button -->
  <a
    v-else-if="isAnchor && !disabled"
    :href="href"
    :target="target"
    class="text-decoration-none"
  >
    <v-btn v-bind="buttonProps" @click="handleClick">
      <v-icon v-if="icon && iconPosition === 'left'" :icon="icon" class="mr-2"></v-icon>
      <span v-if="label">{{ label }}</span>
      <slot></slot>
      <v-icon v-if="icon && iconPosition === 'right'" :icon="icon" class="ml-2"></v-icon>
    </v-btn>
  </a>
  
  <!-- Regular Button -->
  <v-btn v-else v-bind="buttonProps" @click="handleClick">
    <v-icon v-if="icon && iconPosition === 'left'" :icon="icon" class="mr-2"></v-icon>
    <span v-if="label">{{ label }}</span>
    <slot></slot>
    <v-icon v-if="icon && iconPosition === 'right'" :icon="icon" class="ml-2"></v-icon>
  </v-btn>
</template>

<style scoped>
.base-button {
  font-weight: 500;
  letter-spacing: 0.0178571em;
  text-transform: none;
  transition: all 0.3s ease;
}

.base-button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Ensure proper spacing when loading */
.base-button.v-btn--loading .v-btn__content {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }
}

:global(.reduced-motion) .base-button {
  transition: none;
}
</style> 