/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import vuetify from './plugins/vuetify'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Styles
import 'unfonts.css'

// Import new router structure
import router from './router/index'
// Keep old router as backup
// import router from './router'

const app = createApp(App)

// Use Pinia for state management
const pinia = createPinia()
app.use(pinia)

// Toast configuration
const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

registerPlugins(app)
app.use(router)
app.use(vuetify)
app.use(Toast, toastOptions)

app.mount('#app')
