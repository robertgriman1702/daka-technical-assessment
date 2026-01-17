import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import client from '@/api/client'

export interface User {
  id: number
  username: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  // 👤 PERFIL
  const fetchUser = async () => {
    if (!token.value) return
    try {
      const { data } = await client.get<User>('/auth/me')
      user.value = data
    } catch (e) {
      await logout()
      throw e
    }
  }

  const initAuth = async () => {
    if (token.value && !user.value) {
      try {
        await fetchUser()
      } catch {
      }
    }
  }

  // 🔐 LOGIN
  const login = async (username: string, password: string) => {
    const { data } = await client.post('/auth/login', { username, password })

    const receivedToken =
        data.access_token ??
        data.token ??
        data.accessToken   

    if (!receivedToken) {
      throw new Error('Auth response did not include a token (access_token/token).')
    }

    token.value = receivedToken
    sessionStorage.setItem('token', receivedToken)

    await fetchUser()
  }

  // 📝 REGISTER
  const register = async (
    username: string,
    password: string,
    confirmPassword: string,
  ) => {
    await client.post('/auth/register', { username, password, confirmPassword })
  }

  // 🚪 LOGOUT
  const logout = async () => {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
  }

  return {
    token,
    user,
    isAuthenticated,
    initAuth,
    login,
    register,
    fetchUser,
    logout,
  }
})
