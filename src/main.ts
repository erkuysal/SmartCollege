/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App
 */

// Import the Vue app and necessary libraries
import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Import the main App component
import App from './App.vue';

// Import styles
// import './styles/main.scss';

// Import the function to register all plugins
import { registerPlugins } from '@/plugins';

// Create the Vue app instance
const app = createApp(App);

// Create the Pinia instance for state management
const pinia = createPinia();

// Use Pinia
app.use(pinia);

// Register all plugins (e.g., Vuetify, Router)
registerPlugins(app);

// Mount the Vue app to the DOM
app.mount('#app');
