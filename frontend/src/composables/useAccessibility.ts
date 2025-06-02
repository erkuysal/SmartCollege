import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { Ref } from 'vue';
import { STORAGE_KEYS } from '@/config/constants';

interface AccessibilityOptions {
  /**
   * Enable high contrast mode
   */
  highContrast: Ref<boolean>;
  
  /**
   * Enable larger text
   */
  largeText: Ref<boolean>;
  
  /**
   * Enable reduced motion
   */
  reducedMotion: Ref<boolean>;
  
  /**
   * Enable focus indicators
   */
  focusIndicators: Ref<boolean>;
  
  /**
   * Screen reader announcements
   */
  screenReaderAnnounce: (message: string, politeness?: 'polite' | 'assertive') => void;
}

/**
 * Composable for managing accessibility features
 */
export function useAccessibility(): AccessibilityOptions {
  // State
  const highContrast = ref(false);
  const largeText = ref(false);
  const reducedMotion = ref(false);
  const focusIndicators = ref(true);
  
  // DOM references
  let announcer: HTMLElement | null = null;
  
  /**
   * Setup accessibility features on mount
   */
  onMounted(() => {
    // Check saved preferences from localStorage
    loadPreferences();
    
    // Check system preferences
    checkSystemPreferences();
    
    // Create screen reader announcer
    createAnnouncer();
    
    // Apply initial classes
    applyAccessibilityClasses();
    
    // Update when prefers-color-scheme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkSystemPreferences);
    
    // Update when prefers-reduced-motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkSystemPreferences);
  });
  
  /**
   * Clean up event listeners and DOM elements
   */
  onBeforeUnmount(() => {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', checkSystemPreferences);
    window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', checkSystemPreferences);
    
    if (announcer && document.body.contains(announcer)) {
      document.body.removeChild(announcer);
    }
  });
  
  /**
   * Load user preferences from localStorage
   */
  const loadPreferences = () => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.userSettings);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        if (settings.accessibility) {
          highContrast.value = settings.accessibility.highContrast ?? false;
          largeText.value = settings.accessibility.largeText ?? false;
          reducedMotion.value = settings.accessibility.reducedMotion ?? false;
          focusIndicators.value = settings.accessibility.focusIndicators ?? true;
        }
      }
    } catch (error) {
      console.error('Error loading accessibility preferences:', error);
    }
  };
  
  /**
   * Check system preferences for accessibility settings
   */
  const checkSystemPreferences = () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      reducedMotion.value = true;
    }
    
    // Apply changes
    applyAccessibilityClasses();
    savePreferences();
  };
  
  /**
   * Apply accessibility classes to document root
   */
  const applyAccessibilityClasses = () => {
    document.documentElement.classList.toggle('high-contrast', highContrast.value);
    document.documentElement.classList.toggle('large-text', largeText.value);
    document.documentElement.classList.toggle('reduced-motion', reducedMotion.value);
    document.documentElement.classList.toggle('focus-visible', focusIndicators.value);
  };
  
  /**
   * Save preferences to localStorage
   */
  const savePreferences = () => {
    try {
      let settings = {};
      const storedSettings = localStorage.getItem(STORAGE_KEYS.userSettings);
      
      if (storedSettings) {
        settings = JSON.parse(storedSettings);
      }
      
      settings = {
        ...settings,
        accessibility: {
          highContrast: highContrast.value,
          largeText: largeText.value,
          reducedMotion: reducedMotion.value,
          focusIndicators: focusIndicators.value
        }
      };
      
      localStorage.setItem(STORAGE_KEYS.userSettings, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving accessibility preferences:', error);
    }
  };
  
  /**
   * Create the screen reader announcer element
   */
  const createAnnouncer = () => {
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  };
  
  /**
   * Announce message to screen readers
   */
  const screenReaderAnnounce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    if (!announcer) return;
    
    // Set the appropriate politeness level
    announcer.setAttribute('aria-live', politeness);
    
    // Clear the announcer first (required for some screen readers to announce the same message twice)
    announcer.textContent = '';
    
    // Set the new message after a short delay
    setTimeout(() => {
      announcer!.textContent = message;
    }, 50);
  };
  
  // Create watchers to apply changes and save preferences when values change
  watch(highContrast, () => {
    applyAccessibilityClasses();
    savePreferences();
  });
  
  watch(largeText, () => {
    applyAccessibilityClasses();
    savePreferences();
  });
  
  watch(reducedMotion, () => {
    applyAccessibilityClasses();
    savePreferences();
  });
  
  watch(focusIndicators, () => {
    applyAccessibilityClasses();
    savePreferences();
  });
  
  // Return the public API
  return {
    highContrast,
    largeText,
    reducedMotion,
    focusIndicators,
    screenReaderAnnounce
  };
}

export default useAccessibility; 