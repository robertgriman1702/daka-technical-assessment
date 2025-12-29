<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Watcher para detectar eliminación manual del token
let intervalId: number
onMounted(() => {
  intervalId = window.setInterval(() => {
    const storedToken = sessionStorage.getItem('token')
    if (authStore.token && !storedToken) {
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
/* Global resets if needed, but Tailwind handles most */
html, body, #app {
  height: 100%;
  margin: 0;
}
</style>
