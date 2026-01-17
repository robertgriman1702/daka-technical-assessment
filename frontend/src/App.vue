<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

let intervalId: number

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  intervalId = window.setInterval(() => {
    const storedToken = sessionStorage.getItem('token')
    if (authStore.token !== null && storedToken === null) {
      handleLogout()
    }
  }, 1000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div class="h-full">
    <router-view />
  </div>
</template>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}
</style>
