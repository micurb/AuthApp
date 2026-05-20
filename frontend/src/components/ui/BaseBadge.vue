<script setup>
defineProps({
	variant: {
		type: String,
		default: "gray",
	},
});
</script>

<template>
	<span
		class="rounded-full px-3 py-1 text-xs font-semibold"
		:class="{
			'bg-gray-100 text-gray-700': variant === 'gray',
			'bg-green-100 text-green-700': variant === 'success',
			'bg-red-100 text-red-700': variant === 'danger',
			'bg-amber-100 text-amber-700': variant === 'warning',
			'bg-blue-100 text-blue-700': variant === 'info',
			'bg-purple-100 text-purple-700': variant === 'purple',
		}">
		<slot />
	</span>
</template>