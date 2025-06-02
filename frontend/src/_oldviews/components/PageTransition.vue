<template>
  <transition
    :name="transitionName"
    :mode="mode"
    :appear="appear"
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
  >
    <slot></slot>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'zoom' | 'none';

const props = defineProps({
  /**
   * Type of transition animation
   */
  type: {
    type: String as () => TransitionType,
    default: 'fade'
  },
  /**
   * Transition mode (default: out-in)
   */
  mode: {
    type: String,
    default: 'out-in'
  },
  /**
   * Whether the transition should occur on first render
   */
  appear: {
    type: Boolean,
    default: true
  },
  /**
   * Transition duration in milliseconds
   */
  duration: {
    type: Number,
    default: 250
  },
  /**
   * Whether to disable transitions
   */
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'before-enter',
  'enter',
  'after-enter',
  'before-leave',
  'leave',
  'after-leave'
]);

// Get current route
const route = useRoute();

// Store previous path to determine direction
const previousPath = ref('');
const transitionName = ref(props.type);

// Determine direction based on route depth
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (props.disabled) {
      transitionName.value = 'none';
      return;
    }

    previousPath.value = oldPath || '';

    // For fixed transition types, don't change
    if (['fade', 'zoom', 'none'].includes(props.type)) {
      transitionName.value = props.type;
      return;
    }

    // For directional transitions, determine direction
    if (newPath.split('/').length > oldPath.split('/').length) {
      // Going deeper in navigation
      transitionName.value = props.type === 'slide-left' || props.type === 'slide-right' 
        ? 'slide-left' 
        : 'slide-up';
    } else if (newPath.split('/').length < oldPath.split('/').length) {
      // Going back in navigation
      transitionName.value = props.type === 'slide-left' || props.type === 'slide-right' 
        ? 'slide-right' 
        : 'slide-down';
    } else {
      // Same level but different route
      transitionName.value = props.type;
    }
  }
);

// Set initial transition name
onMounted(() => {
  transitionName.value = props.disabled ? 'none' : props.type;
});

// Animation hooks with duration control
const beforeEnter = (el: Element) => {
  emit('before-enter', el);
  
  if (props.disabled) return;

  if (el instanceof HTMLElement) {
    el.style.transition = `all ${props.duration}ms cubic-bezier(0.25, 0.8, 0.5, 1)`;
  }
};

const enter = (el: Element, done: () => void) => {
  emit('enter', el, done);
  
  if (props.disabled) {
    done();
    return;
  }
  
  setTimeout(done, props.duration);
};

const afterEnter = (el: Element) => {
  emit('after-enter', el);
  
  if (el instanceof HTMLElement) {
    el.style.transition = '';
  }
};

const beforeLeave = (el: Element) => {
  emit('before-leave', el);
  
  if (props.disabled) return;

  if (el instanceof HTMLElement) {
    el.style.transition = `all ${props.duration}ms cubic-bezier(0.25, 0.8, 0.5, 1)`;
  }
};

const leave = (el: Element, done: () => void) => {
  emit('leave', el, done);
  
  if (props.disabled) {
    done();
    return;
  }
  
  setTimeout(done, props.duration);
};

const afterLeave = (el: Element) => {
  emit('after-leave', el);
  
  if (el instanceof HTMLElement) {
    el.style.transition = '';
  }
};
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Left transition */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1),
              opacity v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-left-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Slide Right transition */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1),
              opacity v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Slide Up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1),
              opacity v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Slide Down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1),
              opacity v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1);
}

.slide-down-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Zoom transition */
.zoom-enter-active,
.zoom-leave-active {
  transition: transform v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1),
              opacity v-bind('`${props.duration}ms`') cubic-bezier(0.25, 0.8, 0.5, 1);
}

.zoom-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.zoom-leave-to {
  transform: scale(1.05);
  opacity: 0;
}

/* No transition */
.none-enter-active,
.none-leave-active {
  transition: none;
}
</style> 