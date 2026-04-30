<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()

const adminMenu = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Użytkownicy', path: '/users' },
  { label: 'Ustawienia', path: '/settings' },
]

const userMenu = [
  { label: 'Dashboard', path: '/dashboard' },
]

const menuItems = computed(() => {
  return auth.user?.role === 'ADMIN' ? adminMenu : userMenu
})
</script>

<template>
  <aside class="fixed left-0 top-0 hidden h-screen w-72 border-r border-gray-200 bg-white lg:block">
    <div class="flex h-16 items-center border-b border-gray-200 px-6">
      <span class="text-lg font-semibold text-gray-900">
        System SMI
      </span>
    </div>

    <nav class="p-4">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        active-class="bg-blue-50 text-blue-700"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>