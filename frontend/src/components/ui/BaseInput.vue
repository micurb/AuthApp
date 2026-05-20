<script setup>
defineProps({
	label: {
		type: String,
		default: "",
	},
	modelValue: {
		type: [String, Number],
		default: "",
	},
	type: {
		type: String,
		default: "text",
	},
	placeholder: {
		type: String,
		default: "",
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
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
	<div>
		<label v-if="label" class="mb-1 block text-sm font-medium text-gray-700">
			{{ label }}

			<span v-if="required" class="text-red-500">*</span>
		</label>

		<div class="relative">
			<input
				:type="type"
				:value="modelValue"
				:placeholder="placeholder"
				:disabled="disabled"
				@input="emit('update:modelValue', $event.target.value)"
				:class="[
					'w-full rounded-lg border px-4 py-2 text-sm text-gray-800 transition focus:ring-4 focus:outline-hidden disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70',
					$slots.right ? 'pr-12' : '',
					error
						? 'border-red-500 focus:border-red-500 focus:ring-red-100'
						: 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
				]" />

			<div
				v-if="$slots.right"
				class="absolute inset-y-0 right-3 flex items-center">
				<slot name="right" />
			</div>
		</div>
	</div>
</template>
