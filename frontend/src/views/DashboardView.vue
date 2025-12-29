<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { io, Socket } from 'socket.io-client'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import client from '@/api/client'

const router = useRouter()
const authStore = useAuthStore()
const queryClient = useQueryClient()
const socket = ref<Socket | null>(null)
const connectionStatus = ref('Desconectado')
const selectedPokemon = ref<any>(null)
const showDeleteConfirm = ref(false)
const showLogoutConfirm = ref(false)

const openPreview = (pokemon: any) => {
  selectedPokemon.value = pokemon
}

const closePreview = () => {
  selectedPokemon.value = null
}

const handleLogout = () => {
  showLogoutConfirm.value = true
}

const confirmLogout = async () => {
  showLogoutConfirm.value = false
  await authStore.logout()
  router.push('/login')
}


const { data: pokemons, isPending, isError } = useQuery({
  queryKey: ['pokemons'],
  queryFn: async () => {
    const { data } = await client.get('/pokemon')
    return data
  },
  initialData: [] 
})

const connectWebSocket = () => {
  const token = authStore.token
  if (!token) return

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  socket.value = io(apiUrl, {
    auth: { token }
  })

  socket.value.on('connect', () => {
    connectionStatus.value = 'Conectado'
  })

  socket.value.on('disconnect', () => {
    connectionStatus.value = 'Desconectado'
  })


  socket.value.on('sprite-served', (newPokemon: any) => {
    queryClient.setQueryData(['pokemons'], (oldData: any[]) => {
      return oldData ? [...oldData, newPokemon] : [newPokemon]
    })
  })
}

const requestSprite = () => {
  if (socket.value && socket.value.connected) {
    socket.value.emit('request-sprite')
  } else {
    alert('No estás conectado al servidor de sprites')
  }
}


const currentPage = ref(1)
const itemsPerPage = ref(12)

import { watch } from 'vue'
watch(itemsPerPage, () => {
  currentPage.value = 1
})

const paginatedPokemons = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return pokemons.value ? pokemons.value.slice(start, end) : []
})

const totalPages = computed(() => {
  return pokemons.value ? Math.ceil(pokemons.value.length / itemsPerPage.value) : 0
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}


const deleteSprite = async (id: number) => {

  queryClient.setQueryData(['pokemons'], (oldData: any[]) => {
     return oldData ? oldData.filter(p => p.id !== id) : []
  })
  

  if (socket.value && socket.value.connected) {
    socket.value.emit('delete-sprite', id)
  } else {
      await client.delete(`/pokemon/${id}`)
  }
}

const deleteAll = async () => {
  if (pokemons.value && pokemons.value.length > 0) {
    showDeleteConfirm.value = true
  }
}

const confirmDeleteAll = async () => {
  showDeleteConfirm.value = false


  queryClient.setQueryData(['pokemons'], [])
  
  try {
    await client.delete('/pokemon/all')
    // Reset pagination
    currentPage.value = 1
  } catch (error) {
    console.error('Error deleting all', error)
    queryClient.invalidateQueries({ queryKey: ['pokemons'] }) // Revert if failed
  }
}


const onBeforeEnter = (el: any) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

const onEnter = (el: any, done: any) => {
  const delay = el.dataset.index * 50 // 50ms delay per item
  setTimeout(() => {
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
    done()
  }, delay)
}

onMounted(() => {
  authStore.fetchUser()
  connectWebSocket()
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.disconnect()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
             <h1 class="text-2xl font-bold text-indigo-600">DAKA Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
             <span class="text-gray-700" v-if="authStore.user">Hola, {{ authStore.user.username }}</span>
             <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-200">
               Cerrar Sesión
             </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
       <!-- User Info Card -->
       <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg mb-8" v-if="authStore.user">
         <div class="p-6">
           <h2 class="text-xl font-semibold mb-4 text-gray-800">Perfil de Usuario</h2>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                 <p class="text-sm text-gray-500">User ID</p>
                 <p class="text-lg font-medium">{{ authStore.user.id }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                 <p class="text-sm text-gray-500">Username</p>
                 <p class="text-lg font-medium">{{ authStore.user.username }}</p>
              </div>
           </div>
         </div>
       </div>

       <!-- Pokemon Section -->
       <div class="bg-white overflow-hidden shadow-xl sm:rounded-lg">
          <div class="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
             <h3 class="text-lg leading-6 font-medium text-gray-900">
               Galería de Pokémon Sprites
             </h3>
             <div class="flex space-x-3">
               <button 
                 @click="deleteAll" 
                 :disabled="pokemons.length === 0"
                 class="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md shadow transition duration-200 flex items-center"
               >
                 <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
                 Eliminar Todos
               </button>
               <button 
                 @click="requestSprite" 
                 :disabled="connectionStatus !== 'Conectado'"
                 class="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-md shadow transition duration-200 flex items-center"
               >
                 <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
                 Descargar Sprite
               </button>
             </div>
          </div>
          
          <div class="p-6">
            <div v-if="paginatedPokemons.length > 0">
               <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 min-h-[300px]">
                  <transition-group 
                    name="list" 
                    :css="false" 
                    @before-enter="onBeforeEnter" 
                    @enter="onEnter"
                  >
                      <div 
                        v-for="(poke, index) in paginatedPokemons" 
                        :key="poke.id" 
                        :data-index="index"
                        @click="openPreview(poke)"
                        class="cursor-pointer bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 relative group"
                      >
                          <div class="w-24 h-24 flex items-center justify-center">
                            <img :src="poke.url" :alt="poke.name" class="max-w-full max-h-full drop-shadow-md" />
                          </div>
                          <p class="mt-2 text-sm font-semibold text-gray-700 capitalize">{{ poke.name }}</p>
                          
                          <button 
                            @click.stop="deleteSprite(poke.id)" 
                            class="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Eliminar"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                      </div>
                  </transition-group>
               </div>

               <!-- Pagination Controls -->
               <div class="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div class="flex items-center">
                    <span class="text-sm text-gray-700 mr-2">Mostrar:</span>
                    <select 
                      v-model="itemsPerPage" 
                      class="block w-24 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option :value="12">12</option>
                      <option :value="24">24</option>
                      <option :value="36">36</option>
                    </select>
                  </div>
                  
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="prevPage" 
                      :disabled="currentPage === 1"
                      class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span class="text-sm text-gray-700">
                      Página {{ currentPage }} de {{ totalPages }}
                    </span>
                    <button 
                      @click="nextPage" 
                      :disabled="currentPage === totalPages"
                      class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
               </div>
            </div>
            
            <div v-else class="text-center py-10">
               <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <h3 class="mt-2 text-sm font-medium text-gray-900">No hay sprites</h3>
               <p class="mt-1 text-sm text-gray-500">Comienza descargando algunos sprites de la API.</p>
            </div>
          </div>
       </div>
    </main>

    <!-- Image Preview Modal -->
    <transition name="modal-fade">
      <div v-if="selectedPokemon" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" @click="closePreview">
        <transition name="modal-scale" appear>
          <div class="bg-white p-4 rounded-lg shadow-2xl max-w-lg w-full m-4 relative transform" @click.stop>
            <button @click="closePreview" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
               <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
            <div class="flex flex-col items-center">
              <img :src="selectedPokemon.url" :alt="selectedPokemon.name" class="w-64 h-64 object-contain" />
              <h3 class="mt-4 text-2xl font-bold text-gray-900 capitalize">{{ selectedPokemon.name }}</h3>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="showDeleteConfirm = false">
        <transition name="modal-scale" appear>
          <div class="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" @click.stop>
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Eliminar todos los Pokémon
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar todos los sprites? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                @click="confirmDeleteAll"
              >
                Eliminar Todo
              </button>
              <button 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                @click="showDeleteConfirm = false"
              >
                Cancelar
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>

    <!-- Logout Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showLogoutConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="showLogoutConfirm = false">
        <transition name="modal-scale" appear>
          <div class="bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" @click.stop>
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <!-- Heroicon name: outline/logout -->
                <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Cerrar Sesión
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Estás seguro de que deseas salir de la aplicación?
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button 
                type="button" 
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                @click="confirmLogout"
              >
                Cerrar Sesión
              </button>
              <button 
                type="button" 
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                @click="showLogoutConfirm = false"
              >
                Cancelar
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<style scoped>

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.3s ease;
}
.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
