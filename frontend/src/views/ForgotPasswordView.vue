<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

import AuthLayout from "../layouts/AuthLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import { api } from "../api";

const { t } = useI18n();

const email = ref("");
const successKey = ref(null);
const errorKey = ref(null);
const validationError = ref(null);
const loading = ref(false);

const isValidEmail = email => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const submit = async () => {
	successKey.value = null;
	errorKey.value = null;
	validationError.value = null;

	if (!email.value) {
		validationError.value = "validation.requiredEmail";
		return;
	}

	if (!isValidEmail(email.value)) {
		validationError.value = "validation.invalidEmail";
		return;
	}

	try {
		loading.value = true;

		await api.post("/auth/forgot-password", {
			email: email.value,
		});

		successKey.value = "forgotPassword.success";
	} catch (err) {
		errorKey.value = "forgotPassword.error";
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
					{{ t("forgotPassword.title") }}
				</h1>

				<p class="text-sm text-gray-500">
					{{ t("forgotPassword.subtitle") }}
				</p>
			</div>

			<form @submit.prevent="submit">
				<div class="space-y-5">
					<div>
						<label
							class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
							{{ t("forgotPassword.email") }}
							<span class="text-red-500">*</span>
						</label>

						<input
							v-model="email"
							type="email"
							:placeholder="t('forgotPassword.emailPlaceholder')"
							:class="[
								'shadow-theme-xs h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition focus:ring-4 focus:outline-hidden',
								validationError
									? 'border-red-500 focus:border-red-500 focus:ring-red-100'
									: 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
							]" />
					</div>

					<BaseAlert
						v-if="validationError || errorKey"
						type="error"
						:message="t(validationError || errorKey)" />

					<BaseAlert
						v-if="successKey"
						type="success"
						:message="t(successKey)" />

					<BaseButton
						type="submit"
						variant="primary"
						:full-width="true"
						:disabled="loading">
						{{
							loading ? t("forgotPassword.sending") : t("forgotPassword.submit")
						}}
					</BaseButton>

					<div class="text-center">
						<RouterLink
							to="/login"
							class="text-sm font-medium text-blue-600 hover:text-blue-700">
							{{ t("forgotPassword.backToLogin") }}
						</RouterLink>
					</div>
				</div>
			</form>
		</div>
	</AuthLayout>
</template>
