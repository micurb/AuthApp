<script setup>
defineProps({
	type: {
		type: String,
		default: "info",
	},
	message: {
		type: String,
		default: "",
	},
});
</script>

<template>
	<div
		v-if="message"
		class="rounded-lg px-4 py-3 text-sm"
		:class="{
			'bg-red-50 text-red-700': type === 'error',
			'bg-green-50 text-green-700': type === 'success',
			'bg-blue-50 text-blue-700': type === 'info',
			'bg-amber-50 text-amber-700': type === 'warning',
		}">
		{{ message }}
	</div>
</template>