<script setup>
defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	label: {
		type: String,
		default: "",
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
	<label
		class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
		:class="disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'">
		<input
			type="checkbox"
			:checked="modelValue"
			:disabled="disabled"
			@change="emit('update:modelValue', $event.target.checked)"
			class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500" />

		<span>
			{{ label }}
		</span>
	</label>
</template>