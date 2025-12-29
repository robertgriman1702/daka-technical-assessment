<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed, ref } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const schema = toTypedSchema(z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida').min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmar contraseña es requerido').min(6, 'La contraseña debe tener al menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}))

const { errors, defineField, handleSubmit } = useForm({
  validationSchema: schema,
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

const { mutate, isPending, error: mutationError } = useMutation({
  mutationFn: async (values: any) => {
    await authStore.register(values.username, values.password, values.confirmPassword)
  },
  onSuccess: () => {
    router.push('/login')
  },
})

const onSubmit = handleSubmit((values) => {
  mutate(values)
})

const errorMessage = computed(() => {
  if (!mutationError.value) return ''
  const err = mutationError.value as any
  return err.response?.data?.message || err.message || 'Error al registrar usuario'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300">
      <div>
        <h1 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Registro de Usuario
        </h1>
        <p class="mt-2 text-center text-sm text-gray-600">
          Únete a la comunidad DAKA
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
        <div class="space-y-4">
          <div>
            <label for="username" class="sr-only">Usuario</label>
            <input
              id="username"
              v-model="username"
              v-bind="usernameAttrs"
              type="text"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:z-10 sm:text-sm',
                errors.username 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
              ]"
              placeholder="Nombre de Usuario"
            />
            <p v-if="errors.username" class="text-red-500 text-xs mt-1">{{ errors.username }}</p>
          </div>
          <div class="relative">
            <label for="password" class="sr-only">Contraseña</label>
            <input
              id="password"
              v-model="password"
              v-bind="passwordAttrs"
              :type="showPassword ? 'text' : 'password'"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:z-10 sm:text-sm pr-10',
                errors.password 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
              ]"
              placeholder="Contraseña"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center z-20 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>
          <div class="relative">
            <label for="confirmPassword" class="sr-only">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              v-bind="confirmPasswordAttrs"
              :type="showConfirmPassword ? 'text' : 'password'"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:z-10 sm:text-sm pr-10',
                errors.confirmPassword 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
              ]"
              placeholder="Confirmar Contraseña"
            />
            <button 
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center z-20 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
            <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
          </div>
        </div>

        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ errorMessage }}</h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isPending"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
              </svg>
            </span>
            {{ isPending ? 'Registrando...' : 'Registrarse' }}
          </button>
        </div>
      </form>

      <div class="text-center">
        <p class="text-sm text-gray-600">
          ¿Ya tienes cuenta? 
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
            Inicia sesión aquí
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind handles styles now */
</style>
