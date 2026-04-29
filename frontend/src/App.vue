<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])

onMounted(async () => {
  const res = await fetch('http://localhost:3000/users')
  users.value = await res.json()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-10">
    <h1 class="text-3xl font-bold mb-6">Users</h1>

    <ul class="space-y-2">
      <li
        v-for="user in users"
        :key="user.id"
        class="p-4 bg-white rounded shadow"
      >
        {{ user.email }} - {{ user.name }}
      </li>
    </ul>
  </div>
</template>