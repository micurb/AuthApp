<script setup>
import { computed } from "vue";

const props = defineProps({
	type: {
		type: String,
		default: "button",
	},
	variant: {
		type: String,
		default: "primary",
	},
	size: {
		type: String,
		default: "md",
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	fullWidth: {
		type: Boolean,
		default: false,
	},
});

const variantClass = computed(() => {
	switch (props.variant) {
		case "secondary":
			return "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100";

		case "danger":
			return "bg-red-600 text-white hover:bg-red-700";

		case "warning":
			return "bg-amber-600 text-white hover:bg-amber-700";

		case "success":
			return "bg-green-600 text-white hover:bg-green-700";

		default:
			return "bg-blue-600 text-white hover:bg-blue-700";
	}
});

const sizeClass = computed(() => {
	switch (props.size) {
		case "sm":
			return "px-3 py-1.5 text-sm";

		case "lg":
			return "px-4 py-3 text-sm";

		default:
			return "px-4 py-2 text-sm";
	}
});
</script>

<template>
	<button
		:type="type"
		:disabled="disabled"
		:class="[
			'flex cursor-pointer items-center justify-center rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
			fullWidth ? 'w-full' : '',
			variantClass,
			sizeClass,
		]">
		<slot />
	</button>
</template>