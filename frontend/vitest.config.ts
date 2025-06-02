import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath } from 'url'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts,jsx,tsx,vue}'],
      exclude: [
        'src/test/**',
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts,jsx,tsx}',
        'src/**/*.spec.{js,ts,jsx,tsx}',
      ],
    },
    deps: {
      inline: [/vuetify/],
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
}) 