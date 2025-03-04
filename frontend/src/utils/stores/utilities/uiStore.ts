import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  timeout?: number;
  dismissible?: boolean;
}

export const useUIStore = defineStore('ui', () => {
  // State
  const darkMode = ref(localStorage.getItem('darkMode') === 'true');
  const sidebarOpen = ref(true);
  const notifications = ref<Notification[]>([]);

  // Actions
  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    localStorage.setItem('darkMode', darkMode.value.toString());
  }

  function setDarkMode(value: boolean) {
    darkMode.value = value;
    localStorage.setItem('darkMode', value.toString());
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function setSidebarOpen(value: boolean) {
    sidebarOpen.value = value;
  }

  function addNotification(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString();
    const newNotification: Notification = {
      id,
      dismissible: true,
      timeout: 5000,
      ...notification
    };
    
    notifications.value = [...notifications.value, newNotification];
    
    if (newNotification.timeout && newNotification.timeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.timeout);
    }
    
    return id;
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(notification => notification.id !== id);
  }

  function clearNotifications() {
    notifications.value = [];
  }

  return {
    // State
    darkMode,
    sidebarOpen,
    notifications,
    
    // Actions
    toggleDarkMode,
    setDarkMode,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    removeNotification,
    clearNotifications
  };
}); 