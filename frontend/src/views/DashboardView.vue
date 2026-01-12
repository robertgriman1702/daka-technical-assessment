<script setup lang="ts">
// TODO: Implementar Dashboard con WebSockets
// Requisitos:
// 1. Conectar a WebSocket (autenticado con JWT)
// 2. Mostrar lista de sprites recibidos
// 3. Botón para solicitar nuevo sprite
// 4. Botón para limpiar lista
// 5. Implementar logout
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Pokemon Dashboard</h1>
        <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout (TODO)
        </button>
      </header>

      <div class="bg-white p-8 rounded-lg shadow text-center">
        <h2 class="text-xl font-semibold mb-4 text-gray-700">Esperando implementación...</h2>
        <p class="text-gray-500">
          Aquí debes mostrar los sprites de Pokémon recibidos vía WebSocket.
        </p>
      </div>
    </div>
  </div>
</template>
