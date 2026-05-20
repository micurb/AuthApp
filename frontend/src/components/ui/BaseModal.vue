<script setup>
defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	title: {
		type: String,
		default: "",
	},
	size: {
		type: String,
		default: "md",
	},
});

const emit = defineEmits(["update:modelValue"]);

const close = () => {
	emit("update:modelValue", false);
};
</script>

<template>
	<div
		v-if="modelValue"
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
		<div
			class="w-full rounded-2xl bg-white p-6 shadow-xl"
			:class="{
				'max-w-md': size === 'sm',
				'max-w-xl': size === 'md',
				'max-w-3xl': size === 'lg',
			}">
			<div v-if="title" class="mb-4 flex items-center justify-between gap-4">
				<h3 class="text-lg font-semibold text-gray-900">
					{{ title }}
				</h3>

				<button
					type="button"
					@click="close"
					class="cursor-pointer text-xl leading-none text-gray-400 hover:text-gray-700">
					×
				</button>
			</div>

			<slot />

			<div v-if="$slots.footer" class="mt-6 flex justify-end gap-3">
				<slot name="footer" />
			</div>
		</div>
	</div>
</template>