import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@primevue/nuxt-module'
  ],
  primevue: {
    options: {
      ripple: true, // Ativa o efeito ripple nos botões
      theme: {
        preset: Aura // Define o tema Aura como tema atual
      }
    }
  },
  css: [
    'primeicons/primeicons.css', // Adiciona os estilos dos PrimeIcons globalmente
  ]
});
