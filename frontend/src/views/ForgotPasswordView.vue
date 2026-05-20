<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

import AuthLayout from "../layouts/AuthLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import { api } from "../api";

const { t } = useI18n();

const email = ref("");
const successKey = ref(null);
const errorKey = ref(null);
const validationError = ref(null);
const loading = ref(false);

const isValidEmail = value => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
					<BaseInput
						v-model="email"
						type="email"
						:label="t('forgotPassword.email')"
						:placeholder="t('forgotPassword.emailPlaceholder')"
						:error="Boolean(validationError)"
						required />

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
