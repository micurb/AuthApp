<script setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import DashboardLayout from "../layouts/DashboardLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import BaseTextarea from "../components/ui/BaseTextarea.vue";
import BaseCheckbox from "../components/ui/BaseCheckbox.vue";
import BaseCard from "../components/ui/BaseCard.vue";
import BaseBadge from "../components/ui/BaseBadge.vue";
import { api } from "../api";

const { t } = useI18n();

const templates = ref([]);
const saveLoading = ref(false);
const fetchLoading = ref(false);
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
	lockedUntil: "{{lockedUntil}}",
};

const previewVariables = {
	fullName: "Jan Kowalski",
	temporaryPassword: "Temp123!@#",
	resetLink: "https://smi.local/reset-password?token=example-token",
	lockedUntil: "2026-05-18 14:30",
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
	fetchLoading.value = true;
	error.value = "";

	try {
		const res = await api.get("/email-templates");
		templates.value = res.data;
	} catch (err) {
		error.value = err.response?.data?.message || t("emailTemplates.fetchError");
	} finally {
		fetchLoading.value = false;
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

	saveLoading.value = true;
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

		form.value = {
			name: res.data.name,
			subject: res.data.subject,
			bodyHtml: res.data.bodyHtml,
			isActive: res.data.isActive,
		};

		templates.value = templates.value.map(template =>
			template.id === res.data.id ? res.data : template
		);

		success.value = t("emailTemplates.saved");
	} catch (err) {
		error.value = err.response?.data?.message || t("emailTemplates.saveError");
	} finally {
		saveLoading.value = false;
	}
};

onMounted(fetchTemplates);

const selectedLanguage = ref("pl");

const filteredTemplates = computed(() => {
	return templates.value.filter(
		template => template.language === selectedLanguage.value
	);
});
</script>

<template>
	<DashboardLayout>
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-gray-900">
				{{ t("emailTemplates.title") }}
			</h1>

			<p class="mt-1 text-sm text-gray-500">
				{{ t("emailTemplates.subtitle") }}
			</p>
		</div>

		<BaseAlert v-if="error" type="error" :message="error" class="mb-4" />

		<BaseAlert v-if="success" type="success" :message="success" class="mb-4" />

		<div class="grid gap-6 lg:grid-cols-3">
			<BaseCard no-padding class="h-fit lg:sticky lg:top-6">
				<div class="border-b border-gray-200 px-5 py-4">
					<h2 class="mb-3 font-semibold text-gray-900">
						{{ t("emailTemplates.listTitle") }}
					</h2>

					<div class="flex gap-2">
						<button
							type="button"
							@click="
								selectedLanguage = 'pl';
								selectedTemplate = null;
								success = '';
								error = '';
							"
							class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition"
							:class="
								selectedLanguage === 'pl'
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							">
							PL
						</button>

						<button
							type="button"
							@click="
								selectedLanguage = 'en';
								selectedTemplate = null;
								success = '';
								error = '';
							"
							class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition"
							:class="
								selectedLanguage === 'en'
									? 'bg-blue-600 text-white'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							">
							EN
						</button>
					</div>
				</div>

				<div class="divide-y divide-gray-100">
					<button
						v-for="template in filteredTemplates"
						:key="template.id"
						type="button"
						@click="selectTemplate(template)"
						class="block w-full px-5 py-4 text-left transition hover:bg-gray-50"
						:class="selectedTemplate?.id === template.id ? 'bg-blue-50' : ''">
						<div class="font-medium text-gray-900">
							{{ template.name }}
						</div>

						<div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
							<span>{{ template.key }}</span>

							<BaseBadge>
								{{ template.language?.toUpperCase() || "PL" }}
							</BaseBadge>
						</div>

						<div class="mt-2">
							<BaseBadge :variant="template.isActive ? 'success' : 'default'">
								{{
									template.isActive
										? t("emailTemplates.active")
										: t("emailTemplates.inactive")
								}}
							</BaseBadge>
						</div>
					</button>
				</div>
			</BaseCard>

			<BaseCard class="lg:col-span-2">
				<div v-if="!selectedTemplate" class="text-sm text-gray-500">
					{{ t("emailTemplates.selectTemplate") }}
				</div>

				<form v-else @submit.prevent="saveTemplate" class="space-y-5">
					<BaseInput
						v-model="form.name"
						type="text"
						:label="t('emailTemplates.name')" />

					<BaseInput
						v-model="form.subject"
						type="text"
						:label="t('emailTemplates.subject')" />

					<BaseTextarea
						v-model="form.bodyHtml"
						:label="t('emailTemplates.bodyHtml')"
						rows="14"
						monospace />

					<BaseCheckbox
						v-model="form.isActive"
						:label="t('emailTemplates.templateActive')" />

					<div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
						<div class="mb-2 text-sm font-medium text-gray-700">
							{{ t("emailTemplates.variables") }}
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

							<span class="rounded-full bg-white px-3 py-1 text-gray-700">
								{{ variables.lockedUntil }}
							</span>
						</div>
					</div>

					<BaseCard class="p-5">
						<div class="mb-3 text-sm font-medium text-gray-700">
							{{ t("emailTemplates.preview") }}
						</div>

						<div
							class="prose max-h-[500px] overflow-auto max-w-none text-sm"
							v-html="previewHtml" />
					</BaseCard>

					<div class="flex justify-end">
						<BaseButton type="submit" variant="primary" :disabled="saveLoading">
							{{
								saveLoading
									? t("emailTemplates.saving")
									: t("emailTemplates.save")
							}}
						</BaseButton>
					</div>
				</form>
			</BaseCard>
		</div>
	</DashboardLayout>
</template>
