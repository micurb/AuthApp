<script setup>
import { ref } from "vue";
import Sidebar from "../components/dashboard/Sidebar.vue";
import Topbar from "../components/dashboard/Topbar.vue";

const mobileSidebarOpen = ref(false);
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<Sidebar
			:mobile-open="mobileSidebarOpen"
			@close="mobileSidebarOpen = false" />

		<div class="lg:pl-72">
			<Topbar @open-sidebar="mobileSidebarOpen = true" />

			<main class="p-4 sm:p-6">
				<slot />
			</main>
		</div>
	</div>
</template>