<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink, useRoute } from "vue-router";

import DashboardLayout from "../layouts/DashboardLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import BaseSelect from "../components/ui/BaseSelect.vue";
import BaseCheckbox from "../components/ui/BaseCheckbox.vue";
import BaseBadge from "../components/ui/BaseBadge.vue";
import BaseCard from "../components/ui/BaseCard.vue";
import { api } from "../api";

const { t, locale } = useI18n();

const profile = ref(null);

const route = useRoute();

const form = ref({
	firstName: "",
	lastName: "",
	phone: "",
	jobTitle: "",
	notificationsEnabled: true,
	preferredLanguage: "pl",
});

const languageOptions = [
	{ value: "pl", label: "Polski" },
	{ value: "en", label: "English" },
];

const messageKey = ref(null);
const errorKey = ref(null);
const errorMessage = ref(null);

const phoneHasError = () => {
	if (!errorMessage.value) return false;

	return errorMessage.value.toLowerCase().includes("telefonu");
};

const roleLabel = () => {
	if (profile.value?.isSuperAdmin) return t("profile.superAdmin");
	if (profile.value?.role === "ADMIN") return t("profile.admin");

	return t("profile.user");
};

onMounted(async () => {
	const res = await api.get("/profile");

	profile.value = res.data;

	form.value = {
		firstName: res.data.firstName || "",
		lastName: res.data.lastName || "",
		phone: res.data.phone || "",
		jobTitle: res.data.jobTitle || "",
		notificationsEnabled: res.data.notificationsEnabled ?? true,
		preferredLanguage: res.data.preferredLanguage || "pl",
	};

	if (route.query.passwordChanged === "1") {
		messageKey.value = "profile.passwordChanged";

		window.history.replaceState({}, document.title, "/profile");
	}
});

const submit = async () => {
	messageKey.value = null;
	errorKey.value = null;
	errorMessage.value = null;

	try {
		const res = await api.patch("/profile", form.value);

		profile.value = {
			...profile.value,
			...res.data,
		};

		locale.value = form.value.preferredLanguage;
		localStorage.setItem("locale", form.value.preferredLanguage);

		messageKey.value = "profile.saved";
	} catch (err) {
		errorMessage.value = err.response?.data?.message || null;
		errorKey.value = "profile.saveError";
	}
};
</script>

<template>
	<DashboardLayout>
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-gray-900">
				{{ t("profile.title") }}
			</h1>
		</div>

		<BaseCard class="mb-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">
				{{ t("profile.summaryTitle") }}
			</h2>

			<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
				<div>
					<p class="text-xs text-gray-500">{{ t("profile.fullName") }}</p>

					<p class="mt-1 font-medium text-gray-900">
						{{ profile?.firstName || "-" }}
						{{ profile?.lastName || "" }}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">{{ t("profile.email") }}</p>

					<p class="mt-1 font-medium text-gray-900">
						{{ profile?.email || "-" }}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">{{ t("profile.phone") }}</p>

					<p class="mt-1 font-medium text-gray-900">
						{{ profile?.phone || "-" }}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">{{ t("profile.jobTitle") }}</p>

					<p class="mt-1 font-medium text-gray-900">
						{{ profile?.jobTitle || "-" }}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">{{ t("profile.role") }}</p>

					<div class="mt-1">
						<BaseBadge v-if="profile?.isSuperAdmin" variant="purple">
							{{ roleLabel() }}
						</BaseBadge>

						<BaseBadge v-else-if="profile?.role === 'ADMIN'" variant="info">
							{{ roleLabel() }}
						</BaseBadge>

						<BaseBadge v-else>
							{{ roleLabel() }}
						</BaseBadge>
					</div>
				</div>

				<div>
					<p class="text-xs text-gray-500">{{ t("profile.lastLogin") }}</p>

					<p class="mt-1 font-medium text-gray-900">
						{{
							profile?.lastLoginAt
								? new Date(profile.lastLoginAt).toLocaleString()
								: "-"
						}}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">
						{{ t("profile.notifications") }}
					</p>

					<div class="mt-1">
						<BaseBadge v-if="profile?.notificationsEnabled" variant="success">
							{{ t("profile.enabled") }}
						</BaseBadge>

						<BaseBadge v-else>
							{{ t("profile.disabled") }}
						</BaseBadge>
					</div>
				</div>
			</div>
		</BaseCard>

		<BaseCard>
			<h2 class="mb-2 text-lg font-semibold text-gray-900">
				{{ t("profile.editTitle") }}
			</h2>

			<p class="mb-3 text-sm text-gray-500">
				{{ t("profile.editSubtitle") }}
			</p>

			<BaseAlert
				v-if="messageKey"
				type="success"
				:message="t(messageKey)"
				class="mb-4" />

			<BaseAlert
				v-if="errorKey"
				type="error"
				:message="errorMessage || t(errorKey)"
				class="mb-4" />

			<form
				@submit.prevent="submit"
				class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				<BaseInput v-model="form.firstName" :label="t('profile.firstName')" />

				<BaseInput v-model="form.lastName" :label="t('profile.lastName')" />

				<BaseInput
					v-model="form.phone"
					:label="t('profile.phone')"
					:error="phoneHasError()" />

				<BaseInput v-model="form.jobTitle" :label="t('profile.jobTitle')" />

				<BaseSelect
					v-model="form.preferredLanguage"
					:label="t('profile.language')"
					:options="languageOptions" />

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						{{ t("profile.notifications") }}
					</label>

					<BaseCheckbox
						v-model="form.notificationsEnabled"
						:label="t('profile.notificationsEnabled')" />
				</div>

				<div class="flex items-end">
					<BaseButton type="submit" variant="primary" :full-width="true">
						{{ t("profile.save") }}
					</BaseButton>
				</div>
			</form>
		</BaseCard>
		<BaseCard class="mt-6">
			<h2 class="mb-2 text-lg font-semibold text-gray-900">
				{{ t("profile.security") }}
			</h2>

			<p class="mb-5 text-sm text-gray-500">
				{{ t("profile.securitySubtitle") }}
			</p>

			<div class="flex justify-start">
				<RouterLink to="/change-password">
					<BaseButton type="button" variant="secondary">
						{{ t("profile.changePassword") }}
					</BaseButton>
				</RouterLink>
			</div>
		</BaseCard>
	</DashboardLayout>
</template>
