<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PropType } from 'vue';

/**
 * Component props
 */
const props = defineProps({
  /**
   * Image source URL
   */
  src: {
    type: String,
    required: true
  },
  /**
   * Fallback image to display on error
   */
  fallbackSrc: {
    type: String,
    default: ''
  },
  /**
   * Placeholder image to display while loading
   */
  placeholderSrc: {
    type: String,
    default: ''
  },
  /**
   * Alternative text for accessibility
   */
  alt: {
    type: String,
    default: ''
  },
  /**
   * Image width
   */
  width: {
    type: [Number, String],
    default: 'auto'
  },
  /**
   * Image height
   */
  height: {
    type: [Number, String],
    default: 'auto'
  },
  /**
   * CSS classes to apply to the image
   */
  imgClass: {
    type: String,
    default: ''
  },
  /**
   * CSS classes to apply to the container
   */
  containerClass: {
    type: String,
    default: ''
  },
  /**
   * Whether to use lazy loading
   */
  lazy: {
    type: Boolean,
    default: true
  },
  /**
   * Image fit style
   */
  fit: {
    type: String as PropType<'cover' | 'contain' | 'fill' | 'none' | 'scale-down'>,
    default: 'cover'
  },
  /**
   * Image position
   */
  position: {
    type: String,
    default: 'center center'
  },
  /**
   * Whether the image is decorative (no alt needed)
   */
  decorative: {
    type: Boolean,
    default: false
  },
  /**
   * Aspect ratio of the image container
   */
  aspectRatio: {
    type: String,
    default: ''
  },
  /**
   * Border radius
   */
  radius: {
    type: [String, Number],
    default: 0
  },
  /**
   * Responsive image srcset
   */
  srcset: {
    type: String,
    default: ''
  },
  /**
   * Responsive image sizes attribute
   */
  sizes: {
    type: String,
    default: ''
  },
  /**
   * Whether to show loading skeleton
   */
  showSkeleton: {
    type: Boolean,
    default: true
  }
});

/**
 * Component emit events
 */
const emits = defineEmits<{
  (e: 'load'): void;
  (e: 'error'): void;
}>();

/**
 * Current image state
 */
const isLoading = ref(true);
const hasError = ref(false);
const imageRef = ref<HTMLImageElement | null>(null);

/**
 * Computed current source based on loading/error state
 */
const currentSrc = computed(() => {
  if (hasError.value && props.fallbackSrc) {
    return props.fallbackSrc;
  }
  
  if (isLoading.value && props.placeholderSrc) {
    return props.placeholderSrc;
  }
  
  return props.src;
});

/**
 * Computed styles for the image element
 */
const imageStyles = computed(() => {
  return {
    objectFit: props.fit,
    objectPosition: props.position,
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius
  };
});

/**
 * Computed styles for the container element
 */
const containerStyles = computed(() => {
  const styles: Record<string, string> = {};
  
  if (props.aspectRatio) {
    styles.aspectRatio = props.aspectRatio;
  }
  
  return styles;
});

/**
 * The alt attribute value, empty if decorative
 */
const altValue = computed(() => {
  return props.decorative ? '' : props.alt;
});

/**
 * ARIA attributes for the image
 */
const ariaAttributes = computed(() => {
  if (props.decorative) {
    return {
      'aria-hidden': true,
      role: 'presentation'
    };
  }
  
  return {};
});

/**
 * Handle image loaded event
 */
const handleLoad = () => {
  isLoading.value = false;
  emits('load');
};

/**
 * Handle image error event
 */
const handleError = () => {
  hasError.value = true;
  isLoading.value = false;
  emits('error');
};

/**
 * Set up intersection observer for lazy loading
 */
onMounted(() => {
  if (!props.lazy || !imageRef.value) {
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      // Only start loading the actual image when it enters viewport
      imageRef.value!.src = props.src;
      
      if (props.srcset) {
        imageRef.value!.srcset = props.srcset;
      }
      
      // Disconnect after image starts loading
      observer.disconnect();
    }
  }, {
    rootMargin: '50px',
    threshold: 0.01
  });
  
  observer.observe(imageRef.value);
});
</script>

<template>
  <div 
    class="base-image-container"
    :class="[containerClass, { 'is-loading': isLoading && showSkeleton }]"
    :style="containerStyles"
  >
    <!-- Loading skeleton -->
    <div v-if="isLoading && showSkeleton" class="image-skeleton"></div>
    
    <!-- Image element -->
    <img
      ref="imageRef"
      :src="lazy ? (placeholderSrc || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') : currentSrc"
      :alt="altValue"
      :style="imageStyles"
      :class="[imgClass, { 'opacity-0': isLoading }]"
      v-bind="ariaAttributes"
      :sizes="sizes"
      :srcset="lazy ? undefined : srcset"
      @load="handleLoad"
      @error="handleError"
      :loading="lazy ? 'lazy' : undefined"
      :decoding="lazy ? 'async' : 'auto'"
    />
  </div>
</template>

<style scoped>
.base-image-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

img {
  max-width: 100%;
  transition: opacity 0.3s ease;
}

.opacity-0 {
  opacity: 0;
}

.image-skeleton {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  img {
    transition: none;
  }
  
  .image-skeleton {
    animation: none;
    background: #f0f0f0;
  }
}

:global(.reduced-motion) img {
  transition: none;
}

:global(.reduced-motion) .image-skeleton {
  animation: none;
  background: #f0f0f0;
}
</style> 