import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
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
  }
})
