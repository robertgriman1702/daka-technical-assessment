<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  // Si hay token pero no user (refresh), intenta cargar
  if (auth.token && !auth.user) {
    try {
      await auth.fetchUser()
    } catch {
      // si falla, store hará logout según tu implementación
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl w-full text-center space-y-8">
      <div>
        <h1 class="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span class="block">Bienvenido a la</span>
          <span class="block text-indigo-600">Aplicación Daka</span>
        </h1>

        <p v-if="auth.user" class="mt-4 text-lg text-gray-700">
          Sesión iniciada como <strong>{{ auth.user.username }}</strong>
        </p>

        <p v-else class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Explora nuestra prueba técnica full-stack diseñada con tecnologías modernas: NestJS, Vue 3, TailwindCSS y WebSockets.
        </p>
      </div>

      <div class="mt-10 flex justify-center gap-4 flex-wrap">
        <router-link
          v-if="!auth.user"
          to="/login"
          class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition"
        >
          Iniciar Sesión
        </router-link>

        <router-link
          v-if="!auth.user"
          to="/register"
          class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition"
        >
          Registrarse
        </router-link>

        <router-link
          to="/dashboard"
          class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition"
        >
          Ver Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>
