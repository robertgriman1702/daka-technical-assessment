<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/api/client'

interface Pokemon {
  id: number
  name: string
  sprite: string
}

const pokemons = ref<Pokemon[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadPokemons = async () => {
  try {
    loading.value = true
    const { data } = await client.get<Pokemon[]>('/pokemon')
    pokemons.value = data
  } catch (e) {
    error.value = 'Error cargando Pokémon'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const requestSprite = async () => {
  try {
    loading.value = true
    const { data } = await client.post<Pokemon>('/pokemon')
    pokemons.value.push(data)
  } catch (e) {
    error.value = 'Error solicitando sprite'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const clearAll = async () => {
  try {
    loading.value = true
    await client.delete('/pokemon')
    pokemons.value = []
  } catch (e) {
    error.value = 'Error limpiando Pokémon'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadPokemons)
</script>

<template>
  <div class="page">
    <div class="card">
      <header class="header">
        <h1>Pokémon Dashboard</h1>

        <div class="actions">
          <button @click="requestSprite" :disabled="loading">
            Nuevo Sprite
          </button>

          <button
            class="danger"
            @click="clearAll"
            :disabled="loading || pokemons.length === 0"
          >
            Limpiar
          </button>
        </div>
      </header>

      <p v-if="loading" class="info">Cargando...</p>
      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="pokemons.length === 0 && !loading" class="empty">
        No hay Pokémon aún
      </div>

      <div class="grid">
        <div v-for="pokemon in pokemons" :key="pokemon.id" class="card-pokemon">
          <img :src="pokemon.sprite" :alt="pokemon.name" />
          <span>{{ pokemon.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 2rem;
}

.card {
  max-width: 1100px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #2563eb;
  color: white;
  font-weight: 500;
}

button:hover {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.danger {
  background: #dc2626;
}

.info {
  color: #374151;
}

.error {
  color: #dc2626;
  margin-bottom: 1rem;
}

.empty {
  text-align: center;
  color: #6b7280;
  margin: 2rem 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.card-pokemon {
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.15s ease;
}

.card-pokemon:hover {
  transform: translateY(-3px);
}

.card-pokemon img {
  width: 96px;
  height: 96px;
}

.card-pokemon span {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.9rem;
}
</style>
