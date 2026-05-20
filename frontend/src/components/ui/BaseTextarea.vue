<script setup>
defineProps({
	label: {
		type: String,
		default: "",
	},
	modelValue: {
		type: String,
		default: "",
	},
	placeholder: {
		type: String,
		default: "",
	},
	rows: {
		type: [String, Number],
		default: 4,
	},
	error: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	required: {
		type: Boolean,
		default: false,
	},
	monospace: {
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

			<span v-if="required" class="text-red-500">*</span>
		</label>

		<textarea
			:value="modelValue"
			:placeholder="placeholder"
			:rows="rows"
			:disabled="disabled"
			@input="emit('update:modelValue', $event.target.value)"
			:class="[
				'w-full rounded-lg border px-3 py-2 text-sm text-gray-800 transition focus:ring-4 focus:outline-hidden disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70',
				monospace ? 'font-mono' : '',
				error
					? 'border-red-500 focus:border-red-500 focus:ring-red-100'
					: 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
			]" />
	</div>
</template>