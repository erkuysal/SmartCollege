export const colors = {
  // Primary colors
  primary: {
    main: '#1976d2',
    light: '#64b5f6',
    dark: '#0d47a1',
    contrast: '#ffffff'
  },
  // Secondary colors
  secondary: {
    main: '#26a69a',
    light: '#80cbc4',
    dark: '#00796b',
    contrast: '#ffffff'
  },
  // Accent colors
  accent: {
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#FF5252'
  },
  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    }
  },
  // Background colors
  background: {
    default: '#ffffff',
    paper: '#f5f7fa',
    card: 'rgba(255, 255, 255, 0.9)'
  },
  // Text colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)'
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
  base: '16px',
  get: (multiplier: number) => `${multiplier * 8}px`
};

export const typography = {
  fontFamily: {
    primary: '"Roboto", "Helvetica", "Arial", sans-serif',
    secondary: '"Roboto Slab", "Times New Roman", serif',
    monospace: '"Roboto Mono", monospace'
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700
  },
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    xxl: '1.5rem',   // 24px
    xxxl: '2rem'     // 32px
  },
  lineHeight: {
    xs: 1.1,
    sm: 1.25,
    md: 1.5,
    lg: 1.75,
    xl: 2
  },
  heading: {
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1 },
    h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 }
  }
};

export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  md: '0 4px 6px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.23)',
  lg: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
  xl: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
  xxl: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)'
};

export const borderRadius = {
  none: '0',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  pill: '9999px',
  circle: '50%'
};

export const transitions = {
  duration: {
    shortest: '120ms',
    short: '200ms',
    standard: '300ms',
    complex: '500ms',
    enteringScreen: '225ms',
    leavingScreen: '195ms'
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  }
};

export const zIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};

export const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  },
  up: (key: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => `@media (min-width: ${breakpoints.values[key]}px)`,
  down: (key: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => {
    const value = breakpoints.values[key];
    return key === 'xl'
      ? '@media (min-width: 0px)'
      : `@media (max-width: ${value - 0.05}px)`;
  },
  between: (start: 'xs' | 'sm' | 'md' | 'lg', end: 'sm' | 'md' | 'lg' | 'xl') => {
    return `@media (min-width: ${breakpoints.values[start]}px) and (max-width: ${breakpoints.values[end] - 0.05}px)`;
  }
};

export default {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
  transitions,
  zIndex,
  breakpoints
}; 