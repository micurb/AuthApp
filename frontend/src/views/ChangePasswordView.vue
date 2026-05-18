<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Eye, EyeOff } from "lucide-vue-next";

import { api } from "../api";
import AuthLayout from "../layouts/AuthLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";

const { t } = useI18n();
const router = useRouter();

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const errorKey = ref(null);
const loading = ref(false);

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const currentPasswordHasError = computed(() => Boolean(errorKey.value));
const newPasswordHasError = computed(() => Boolean(errorKey.value));
const confirmPasswordHasError = computed(() => Boolean(errorKey.value));

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const inputClass = (hasError, extra = "") => [
	`shadow-theme-xs h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 transition focus:ring-4 focus:outline-hidden ${extra}`,
	hasError
		? "border-red-500 focus:border-red-500 focus:ring-red-100"
		: "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
];

const submit = async () => {
	errorKey.value = null;

	if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
		errorKey.value = "validation.requiredFields";
		return;
	}

	if (!passwordRegex.test(newPassword.value)) {
		errorKey.value = "changePassword.passwordPolicy";
		return;
	}

	if (newPassword.value !== confirmPassword.value) {
		errorKey.value = "changePassword.passwordsNotMatch";
		return;
	}

	try {
		loading.value = true;

		await api.patch("/profile/password", {
			currentPassword: currentPassword.value,
			newPassword: newPassword.value,
		});

		router.push("/dashboard");
	} catch (err) {
		errorKey.value = "changePassword.error";
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<AuthLayout>
		<div>
			<div class="mb-5 sm:mb-8">
				<h1 class="font-heading mb-2 text-xl font-semibold text-gray-800">
					{{ t("changePassword.title") }}
				</h1>

				<p class="text-sm text-gray-500">
					{{ t("changePassword.subtitle") }}
				</p>
			</div>

			<form @submit.prevent="submit">
				<div class="space-y-5">
					<div>
						<label
							class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
							{{ t("changePassword.currentPassword") }}
							<span class="text-red-500">*</span>
						</label>

						<div class="relative">
							<input
								v-model="currentPassword"
								:type="showCurrentPassword ? 'text' : 'password'"
								:class="inputClass(currentPasswordHasError)" />

							<button
								type="button"
								:aria-label="
									showCurrentPassword
										? t('changePassword.hidePassword')
										: t('changePassword.showPassword')
								"
								@click="showCurrentPassword = !showCurrentPassword"
								class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showCurrentPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</div>
					</div>

					<div>
						<label
							class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
							{{ t("changePassword.newPassword") }}
							<span class="text-red-500">*</span>
						</label>

						<div class="relative">
							<input
								v-model="newPassword"
								:type="showNewPassword ? 'text' : 'password'"
								:class="inputClass(newPasswordHasError)" />

							<button
								type="button"
								:aria-label="
									showNewPassword
										? t('changePassword.hidePassword')
										: t('changePassword.showPassword')
								"
								@click="showNewPassword = !showNewPassword"
								class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showNewPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</div>
					</div>

					<div>
						<label
							class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
							{{ t("changePassword.confirmPassword") }}
							<span class="text-red-500">*</span>
						</label>

						<div class="relative">
							<input
								v-model="confirmPassword"
								:type="showConfirmPassword ? 'text' : 'password'"
								:class="inputClass(confirmPasswordHasError)" />

							<button
								type="button"
								:aria-label="
									showConfirmPassword
										? t('changePassword.hidePassword')
										: t('changePassword.showPassword')
								"
								@click="showConfirmPassword = !showConfirmPassword"
								class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showConfirmPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</div>
					</div>

					<BaseAlert
						type="info"
						:message="t('changePassword.passwordPolicy')" />

					<BaseAlert v-if="errorKey" type="error" :message="t(errorKey)" />

					<BaseButton
						type="submit"
						variant="primary"
						:full-width="true"
						:disabled="loading">
						{{
							loading ? t("changePassword.saving") : t("changePassword.submit")
						}}
					</BaseButton>
				</div>
			</form>
		</div>
	</AuthLayout>
</template>
