<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import DashboardLayout from "../layouts/DashboardLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import { api } from "../api";

const { t, locale } = useI18n();

const profile = ref(null);

const form = ref({
	firstName: "",
	lastName: "",
	phone: "",
	jobTitle: "",
	notificationsEnabled: true,
	preferredLanguage: "pl",
});

const messageKey = ref(null);
const errorKey = ref(null);
const errorMessage = ref(null);

const phoneHasError = () => {
	if (!errorMessage.value) return false;

	return errorMessage.value.toLowerCase().includes("telefonu");
};

const inputClass = hasError => [
	"w-full rounded-lg border px-4 py-2 text-sm text-gray-800 transition focus:ring-4 focus:outline-hidden",
	hasError
		? "border-red-500 focus:border-red-500 focus:ring-red-100"
		: "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
];

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

		<div class="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
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
						<span
							v-if="profile?.isSuperAdmin"
							class="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
							{{ roleLabel() }}
						</span>

						<span
							v-else-if="profile?.role === 'ADMIN'"
							class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
							{{ roleLabel() }}
						</span>

						<span
							v-else
							class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
							{{ roleLabel() }}
						</span>
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
						<span
							v-if="profile?.notificationsEnabled"
							class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
							{{ t("profile.enabled") }}
						</span>

						<span
							v-else
							class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
							{{ t("profile.disabled") }}
						</span>
					</div>
				</div>
			</div>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-5">
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
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						{{ t("profile.firstName") }}
					</label>

					<input v-model="form.firstName" :class="inputClass(false)" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						{{ t("profile.lastName") }}
					</label>

					<input v-model="form.lastName" :class="inputClass(false)" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						{{ t("profile.phone") }}
					</label>

					<input v-model="form.phone" :class="inputClass(phoneHasError())" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						{{ t("profile.jobTitle") }}
					</label>

					<input v-model="form.jobTitle" :class="inputClass(false)" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						{{ t("profile.language") }}
					</label>

					<select v-model="form.preferredLanguage" :class="inputClass(false)">
						<option value="pl">Polski</option>
						<option value="en">English</option>
					</select>
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						{{ t("profile.notifications") }}
					</label>

					<label
						class="flex h-[42px] items-center gap-3 rounded-lg border border-gray-300 px-4 text-sm text-gray-700">
						<input
							v-model="form.notificationsEnabled"
							type="checkbox"
							class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />

						{{ t("profile.notificationsEnabled") }}
					</label>
				</div>

				<div class="flex items-end">
					<BaseButton type="submit" variant="primary" :full-width="true">
						{{ t("profile.save") }}
					</BaseButton>
				</div>
			</form>
		</div>
	</DashboardLayout>
</template>
