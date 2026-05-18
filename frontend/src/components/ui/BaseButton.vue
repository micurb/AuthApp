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
</script>

<template>
	<button
		:type="type"
		:disabled="disabled"
		:class="[
			'flex items-center cursor-pointer justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
			fullWidth ? 'w-full' : '',
			variantClass,
		]">
		<slot />
	</button>
</template>
