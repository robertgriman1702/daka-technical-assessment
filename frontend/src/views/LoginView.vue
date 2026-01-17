<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const schema = toTypedSchema(
  z.object({
    username: z.string().min(1, 'Username requerido'),
    password: z.string().min(1, 'Password requerido'),
  }),
)

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: schema,
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  errorMessage.value = null
  isLoading.value = true

  try {
    await auth.login(values.username, values.password)

    // ✅ respeta redirect si existe
    const redirect = route.query.redirect
    if (typeof redirect === 'string' && redirect.length) {
      await router.replace(redirect)
    } else {
      // ✅ homepage
      await router.replace('/')
    }
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ??
      err?.message ??
      'Error al iniciar sesión'
    errorMessage.value = Array.isArray(msg) ? msg.join(', ') : String(msg)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <main class="flex min-h-screen items-center justify-center p-4 bg-gray-50">
    <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
      <h1 class="text-2xl font-bold text-center mb-2">Iniciar Sesión</h1>
      <p class="text-center text-gray-500 mb-6 text-sm">
        Ingresa con tu usuario y contraseña
      </p>

      <div
        v-if="errorMessage"
        class="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm"
      >
        {{ errorMessage }}
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            v-model="username"
            v-bind="usernameAttrs"
            type="text"
            autocomplete="username"
            class="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            :class="errors.username ? 'border-red-400' : 'border-gray-300'"
          />
          <p v-if="errors.username" class="text-xs text-red-600 mt-1">
            {{ errors.username }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            autocomplete="current-password"
            class="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
            :class="errors.password ? 'border-red-400' : 'border-gray-300'"
          />
          <p v-if="errors.password" class="text-xs text-red-600 mt-1">
            {{ errors.password }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-indigo-600 text-white rounded px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {{ isLoading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta?
        <router-link class="text-indigo-600 hover:underline" to="/register">
          Regístrate
        </router-link>
      </div>
    </div>
  </main>
</template>
