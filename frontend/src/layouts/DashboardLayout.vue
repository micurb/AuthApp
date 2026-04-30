<script setup>
import Sidebar from '../components/dashboard/Sidebar.vue'
import Topbar from '../components/dashboard/Topbar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Sidebar />

    <div class="lg:pl-72">
      <Topbar />

      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>