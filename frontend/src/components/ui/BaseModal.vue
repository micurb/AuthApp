<script setup>
defineProps({
	show: {
		type: Boolean,
		default: false,
	},
	title: {
		type: String,
		default: "",
	},
	maxWidth: {
		type: String,
		default: "max-w-md",
	},
});

const emit = defineEmits(["close"]);
</script>

<template>
	<div
		v-if="show"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
		<div class="w-full rounded-2xl bg-white p-6 shadow-xl" :class="maxWidth">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-semibold text-gray-900">
					{{ title }}
				</h3>

				<button
					type="button"
					@click="emit('close')"
					class="text-gray-400 transition hover:text-gray-700">
					✕
				</button>
			</div>

			<div>
				<slot />
			</div>
		</div>
	</div>
</template>
