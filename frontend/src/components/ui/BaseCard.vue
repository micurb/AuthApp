<script setup>
defineProps({
	padding: {
		type: String,
		default: "md",
	},
});
</script>

<template>
	<div
		class="rounded-2xl border border-gray-200 bg-white"
		:class="{
			'p-4': padding === 'sm',
			'p-5': padding === 'md',
			'p-6': padding === 'lg',
			'p-0': padding === 'none',
		}">
		<slot />
	</div>
</template>