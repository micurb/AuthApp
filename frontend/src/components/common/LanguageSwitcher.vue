<script setup>
import { computed } from 'vue'
import { i18n } from '../../i18n'

const currentLocale = computed({
  get: () => i18n.global.locale.value,
  set: (value) => {
    i18n.global.locale.value = value
    localStorage.setItem('locale', value)
  },
})
</script>

<template>
  <div class="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
    <button
      type="button"
      @click="currentLocale = 'pl'"
      class="cursor-pointer px-3 py-1.5 text-xs font-medium transition"
      :class="
        currentLocale === 'pl'
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      "
    >
      PL
    </button>

    <button
      type="button"
      @click="currentLocale = 'en'"
      class="cursor-pointer px-3 py-1.5 text-xs font-medium transition"
      :class="
        currentLocale === 'en'
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      "
    >
      EN
    </button>
  </div>
</template>