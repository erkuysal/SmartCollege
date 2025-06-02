import type { Directive, DirectiveBinding } from 'vue';

// Extend HTMLElement with our animation cleanup property
declare global {
  interface HTMLElement {
    _animationCleanup?: () => void;
  }
}

export interface AnimationOptions {
  animation: 
    | 'fade' 
    | 'slide-up' 
    | 'slide-down' 
    | 'slide-left' 
    | 'slide-right' 
    | 'zoom-in' 
    | 'zoom-out' 
    | 'bounce' 
    | 'pulse'
    | 'shake'
    | 'flip';
  duration?: number;
  delay?: number;
  timing?: string;
  iteration?: number | 'infinite';
  trigger?: 'hover' | 'click' | 'scroll' | 'auto';
  threshold?: number; // For scroll trigger (0-1)
  easing?: string;
  fillMode?: 'forwards' | 'backwards' | 'both' | 'none';
}

// Animation keyframes
const keyframes = {
  'fade': [
    { opacity: 0 },
    { opacity: 1 }
  ],
  'slide-up': [
    { transform: 'translateY(20px)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ],
  'slide-down': [
    { transform: 'translateY(-20px)', opacity: 0 },
    { transform: 'translateY(0)', opacity: 1 }
  ],
  'slide-left': [
    { transform: 'translateX(-20px)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ],
  'slide-right': [
    { transform: 'translateX(20px)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ],
  'zoom-in': [
    { transform: 'scale(0.9)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 }
  ],
  'zoom-out': [
    { transform: 'scale(1.1)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1 }
  ],
  'bounce': [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-15px)' },
    { transform: 'translateY(0)' },
    { transform: 'translateY(-5px)' },
    { transform: 'translateY(0)' }
  ],
  'pulse': [
    { transform: 'scale(1)' },
    { transform: 'scale(1.05)' },
    { transform: 'scale(1)' }
  ],
  'shake': [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' }
  ],
  'flip': [
    { transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
    { transform: 'perspective(400px) rotateY(-10deg)', opacity: 1 },
    { transform: 'perspective(400px) rotateY(10deg)' },
    { transform: 'perspective(400px) rotateY(0deg)' }
  ]
};

// Intersection Observer for scroll trigger
const observers = new Map<HTMLElement, IntersectionObserver>();

// Default animation options
const defaultOptions: AnimationOptions = {
  animation: 'fade',
  duration: 500,
  delay: 0,
  timing: 'ease',
  iteration: 1,
  trigger: 'auto',
  threshold: 0.2,
  easing: 'cubic-bezier(0.25, 0.8, 0.5, 1)',
  fillMode: 'both'
};

/**
 * Play animation on element
 */
const playAnimation = (el: HTMLElement, options: AnimationOptions) => {
  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Get animation keyframes
  const frames = keyframes[mergedOptions.animation];
  
  // Create animation options
  const animationOptions: KeyframeAnimationOptions = {
    duration: mergedOptions.duration,
    delay: mergedOptions.delay,
    easing: mergedOptions.easing || mergedOptions.timing,
    iterations: mergedOptions.iteration === 'infinite' ? Infinity : mergedOptions.iteration,
    fill: mergedOptions.fillMode
  };
  
  // Play animation
  return el.animate(frames, animationOptions);
};

/**
 * Setup animation based on trigger
 */
const setupAnimation = (el: HTMLElement, options: AnimationOptions) => {
  // Merge default options with provided options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // Set initial opacity to 0 for auto-triggered animations
  if (mergedOptions.trigger === 'auto' && ['fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out'].includes(mergedOptions.animation)) {
    el.style.opacity = '0';
  }
  
  // Setup based on trigger type
  switch (mergedOptions.trigger) {
    case 'auto':
      // Animate immediately after a small delay
      setTimeout(() => {
        playAnimation(el, mergedOptions);
      }, 50);
      break;
      
    case 'hover':
      // Animate on hover
      const hoverAnimation = () => playAnimation(el, mergedOptions);
      el.addEventListener('mouseenter', hoverAnimation);
      
      // Store event listener for cleanup
      el._animationCleanup = () => {
        el.removeEventListener('mouseenter', hoverAnimation);
      };
      break;
      
    case 'click':
      // Animate on click
      const clickAnimation = () => playAnimation(el, mergedOptions);
      el.addEventListener('click', clickAnimation);
      
      // Store event listener for cleanup
      el._animationCleanup = () => {
        el.removeEventListener('click', clickAnimation);
      };
      break;
      
    case 'scroll':
      // Setup Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Play animation when element comes into view
              playAnimation(el, mergedOptions);
              // Unobserve after triggering
              observer.unobserve(el);
            }
          });
        },
        {
          threshold: mergedOptions.threshold,
          rootMargin: '0px'
        }
      );
      
      // Start observing the element
      observer.observe(el);
      
      // Store observer for cleanup
      observers.set(el, observer);
      break;
  }
};

/**
 * Vue directive for animations
 */
export const vAnimate: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // Get options from binding value
    const options = typeof binding.value === 'object' 
      ? binding.value 
      : { animation: binding.value || 'fade' };
    
    // Setup animation
    setupAnimation(el, options);
  },
  
  beforeUnmount(el: HTMLElement) {
    // Clean up event listeners
    if (el._animationCleanup) {
      el._animationCleanup();
    }
    
    // Clean up Intersection Observer
    if (observers.has(el)) {
      const observer = observers.get(el);
      if (observer) {
        observer.unobserve(el);
        observers.delete(el);
      }
    }
  }
};

// Add TypeScript support for the directive
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    vAnimate: typeof vAnimate;
  }
}

// Export directive
export default vAnimate; 