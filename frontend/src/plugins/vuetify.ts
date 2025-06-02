/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'
import { colors } from '@/assets/styles/designTokens'
import '@/assets/styles/designSystem.css'
import '@/assets/styles/animations.css'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides

// Create theme from our design tokens
const lightTheme = {
  dark: false,
  colors: {
    primary: colors.primary.main,
    'primary-darken-1': colors.primary.dark,
    'primary-lighten-1': colors.primary.light,
    secondary: colors.secondary.main,
    'secondary-darken-1': colors.secondary.dark,
    'secondary-lighten-1': colors.secondary.light,
    accent: colors.accent.info,
    error: colors.accent.error,
    info: colors.accent.info,
    success: colors.accent.success,
    warning: colors.accent.warning,
    // Neutral colors
    background: colors.background.default,
    surface: colors.background.paper,
    'surface-variant': colors.background.card,
    // Text colors
    'on-surface': colors.text.primary,
    'on-surface-variant': colors.text.secondary,
    'on-surface-disabled': colors.text.disabled,
  },
}

// Dark theme
const darkTheme = {
  dark: true,
  colors: {
    primary: colors.primary.light,
    'primary-darken-1': colors.primary.main,
    'primary-lighten-1': '#90CAF9',
    secondary: colors.secondary.light,
    'secondary-darken-1': colors.secondary.main,
    'secondary-lighten-1': '#B2DFDB',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#64B5F6',
    success: '#81C784',
    warning: '#FFD54F',
    // Neutral colors
    background: '#121212',
    surface: '#1E1E1E',
    'surface-variant': '#2C2C2C',
    // Text colors
    'on-surface': 'rgba(255, 255, 255, 0.87)',
    'on-surface-variant': 'rgba(255, 255, 255, 0.6)',
    'on-surface-disabled': 'rgba(255, 255, 255, 0.38)',
  },
}

export default createVuetify({
  blueprint: md3,
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
      darkTheme,
    },
    variations: {
      colors: ['primary', 'secondary', 'accent', 'error', 'info', 'success', 'warning'],
      lighten: 1,
      darken: 1,
    },
  },
  defaults: {
    // Global component defaults
    VCard: {
      elevation: 1,
      rounded: 'lg',
      class: 'transition-all duration-300'
    },
    VBtn: {
      rounded: 'md',
      height: 'auto',
      fontWeight: 500,
      letterSpacing: '0.0178571em',
      minHeight: '40px',
      textTransform: false
    },
    VTextField: {
      variant: 'outlined',
      color: 'primary',
      hideDetails: 'auto',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      color: 'primary',
      hideDetails: 'auto',
      density: 'comfortable'
    },
    VAutocomplete: {
      variant: 'outlined',
      color: 'primary',
      hideDetails: 'auto',
      density: 'comfortable'
    },
    VCombobox: {
      variant: 'outlined',
      color: 'primary',
      hideDetails: 'auto',
      density: 'comfortable'
    },
    VCheckbox: {
      color: 'primary',
      hideDetails: true,
    },
    VRadio: {
      color: 'primary',
      hideDetails: true,
    },
    VSwitch: {
      color: 'primary',
      hideDetails: true,
    },
    VAlert: {
      variant: 'tonal',
      closable: true,
      density: 'comfortable'
    },
    VProgressCircular: {
      color: 'primary',
      indeterminate: true,
    },
    VList: {
      elevation: 0,
      rounded: 'lg',
    },
    VListItem: {
      minHeight: '48px',
      rounded: 'sm',
    },
    VMenu: {
      transition: 'scale-transition',
    },
    VDialog: {
      transition: 'dialog-transition',
      width: '500',
    },
    VDataTable: {
      hover: true,
      density: 'comfortable',
    },
    VBreadcrumbs: {
      divider: '/',
    },
    VPagination: {
      activeColor: 'primary',
      density: 'comfortable',
    },
    VExpansionPanel: {
      elevation: 0,
      rounded: 'lg',
      variant: 'outlined',
    },
    VNavigationDrawer: {
      elevation: 2,
    }
  },
})
