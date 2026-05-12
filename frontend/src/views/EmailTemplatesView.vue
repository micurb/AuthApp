<script setup>
import { computed, onMounted, ref } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { api } from "../api";

const templates = ref([]);
const loading = ref(false);
const error = ref("");
const success = ref("");

const selectedTemplate = ref(null);

const form = ref({
	name: "",
	subject: "",
	bodyHtml: "",
	isActive: true,
});

const variables = {
	fullName: "{{fullName}}",
	temporaryPassword: "{{temporaryPassword}}",
	resetLink: "{{resetLink}}",
};

const previewVariables = {
	fullName: "Jan Kowalski",
	temporaryPassword: "Temp123!@#",
	resetLink: "https://smi.local/reset-password?token=example-token",
};

const previewHtml = computed(() => {
	let html = form.value.bodyHtml || "";

	Object.entries(previewVariables).forEach(([key, value]) => {
		const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
		html = html.replace(regex, value);
	});

	return html;
});

const fetchTemplates = async () => {
	loading.value = true;
	error.value = "";

	try {
		const res = await api.get("/email-templates");
		templates.value = res.data;
	} catch (err) {
		error.value =
			err.response?.data?.message || "Nie udało się pobrać szablonów";
	} finally {
		loading.value = false;
	}
};

const selectTemplate = template => {
	selectedTemplate.value = template;

	form.value = {
		name: template.name,
		subject: template.subject,
		bodyHtml: template.bodyHtml,
		isActive: template.isActive,
	};

	success.value = "";
	error.value = "";
};

const saveTemplate = async () => {
	if (!selectedTemplate.value) return;

	loading.value = true;
	error.value = "";
	success.value = "";

	try {
		const res = await api.patch(
			`/email-templates/${selectedTemplate.value.id}`,
			{
				name: form.value.name,
				subject: form.value.subject,
				bodyHtml: form.value.bodyHtml,
				isActive: form.value.isActive,
			}
		);

		selectedTemplate.value = res.data;

		templates.value = templates.value.map(template =>
			template.id === res.data.id ? res.data : template
		);

		success.value = "Szablon został zapisany";
	} catch (err) {
		error.value =
			err.response?.data?.message || "Nie udało się zapisać szablonu";
	} finally {
		loading.value = false;
	}
};

onMounted(fetchTemplates);
</script>

<template>
	<DashboardLayout>
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-gray-900">Szablony email</h1>

			<p class="mt-1 text-sm text-gray-500">
				Edycja wiadomości wysyłanych automatycznie przez system.
			</p>
		</div>

		<div
			v-if="error"
			class="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
			{{ error }}
		</div>

		<div
			v-if="success"
			class="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
			{{ success }}
		</div>

		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Lista template -->
			<div class="rounded-2xl border border-gray-200 bg-white">
				<div class="border-b border-gray-200 px-5 py-4">
					<h2 class="font-semibold text-gray-900">Lista szablonów</h2>
				</div>

				<div class="divide-y divide-gray-100">
					<button
						v-for="template in templates"
						:key="template.id"
						type="button"
						@click="selectTemplate(template)"
						class="block w-full px-5 py-4 text-left transition hover:bg-gray-50"
						:class="selectedTemplate?.id === template.id ? 'bg-blue-50' : ''">
						<div class="font-medium text-gray-900">
							{{ template.name }}
						</div>

						<div class="mt-1 text-xs text-gray-500">
							{{ template.key }}
						</div>

						<div class="mt-2">
							<span
								class="rounded-full px-2 py-1 text-xs font-semibold"
								:class="
									template.isActive
										? 'bg-green-100 text-green-700'
										: 'bg-gray-100 text-gray-600'
								">
								{{ template.isActive ? "Aktywny" : "Nieaktywny" }}
							</span>
						</div>
					</button>
				</div>
			</div>

			<!-- Edycja -->
			<div
				class="rounded-2xl border border-gray-200 bg-white p-6 lg:col-span-2">
				<div v-if="!selectedTemplate" class="text-sm text-gray-500">
					Wybierz szablon z listy.
				</div>

				<form v-else @submit.prevent="saveTemplate" class="space-y-5">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							Nazwa
						</label>

						<input
							v-model="form.name"
							type="text"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							Temat
						</label>

						<input
							v-model="form.subject"
							type="text"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							Treść HTML
						</label>

						<textarea
							v-model="form.bodyHtml"
							rows="14"
							class="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none" />
					</div>

					<label class="flex items-center gap-2 text-sm text-gray-700">
						<input
							v-model="form.isActive"
							type="checkbox"
							class="rounded border-gray-300" />

						Szablon aktywny
					</label>

					<!-- Variables -->
					<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
						<div class="mb-2 text-sm font-medium text-gray-700">
							Dostępne zmienne
						</div>

						<div class="flex flex-wrap gap-2 text-xs">
							<span class="rounded-full bg-white px-3 py-1 text-gray-700">
								{{ variables.fullName }}
							</span>

							<span class="rounded-full bg-white px-3 py-1 text-gray-700">
								{{ variables.temporaryPassword }}
							</span>

							<span class="rounded-full bg-white px-3 py-1 text-gray-700">
								{{ variables.resetLink }}
							</span>
						</div>
					</div>

					<!-- Preview -->
					<div class="rounded-xl border border-gray-200 p-4">
						<div class="mb-3 text-sm font-medium text-gray-700">Podgląd</div>

						<div class="prose max-w-none text-sm" v-html="previewHtml" />
					</div>

					<div class="flex justify-end">
						<button
							type="submit"
							:disabled="loading"
							class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
							Zapisz szablon
						</button>
					</div>
				</form>
			</div>
		</div>
	</DashboardLayout>
</template>
