<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
    
    <!-- Lewa strona -->
    <div class="text-sm font-medium text-gray-700">
      Dashboard
    </div>

    <!-- Prawa strona -->
    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-600">
        {{ auth.user?.email }}
      </span>

      <button
        @click="logout"
        class="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-100"
      >
        Logout
      </button>
    </div>

  </header>
</template>