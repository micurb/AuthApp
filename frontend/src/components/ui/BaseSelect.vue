<script setup>
defineProps({
	label: {
		type: String,
		default: "",
	},
	modelValue: {
		type: [String, Number, Boolean],
		default: "",
	},
	options: {
		type: Array,
		default: () => [],
	},
	error: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
	<div>
		<label
			v-if="label"
			class="mb-1 block text-sm font-medium text-gray-700">
			{{ label }}
		</label>

		<select
			:value="modelValue"
			:disabled="disabled"
			@change="emit('update:modelValue', $event.target.value)"
			:class="[
				'w-full rounded-lg border px-4 py-2 text-sm text-gray-800 transition focus:ring-4 focus:outline-hidden disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70',
				error
					? 'border-red-500 focus:border-red-500 focus:ring-red-100'
					: 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
			]">
			<option
				v-for="option in options"
				:key="option.value"
				:value="option.value">
				{{ option.label }}
			</option>
		</select>
	</div>
</template>