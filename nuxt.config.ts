import { defineNuxtConfig } from 'nuxt';

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel'
  },
  buildModules: [
    // https://github.com/nuxt-community/supabase-module
    '@nuxtjs/supabase',
    // UI lib
    '@nuxthq/ui',
    // https://github.com/nuxt-community/color-mode-module
    '@nuxtjs/color-mode'
  ],
  ui: {
    colors: {
      primary: 'green'
    }
  },
  publicRuntimeConfig: {
    ENV: process.env.ENV,
    SENTRY_DSN: 'https://0d30323fd78b4f77bf673efccc33449a@o574168.ingest.sentry.io/6346359'
  }
});
