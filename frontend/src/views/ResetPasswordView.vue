<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Eye, EyeOff } from "lucide-vue-next";

import AuthLayout from "../layouts/AuthLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import { api } from "../api";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const token = String(route.query.token || "");

const password = ref("");
const confirmPassword = ref("");

const errorKey = ref(null);
const successKey = ref(null);
const loading = ref(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const passwordHasError = computed(
	() =>
		errorKey.value === "validation.requiredFields" ||
		errorKey.value === "resetPassword.passwordPolicy" ||
		errorKey.value === "resetPassword.passwordsNotMatch" ||
		errorKey.value === "resetPassword.sameAsCurrentPassword" ||
		errorKey.value === "resetPassword.invalidOrExpiredToken" ||
		errorKey.value === "resetPassword.error"
);

const confirmPasswordHasError = computed(
	() =>
		errorKey.value === "validation.requiredFields" ||
		errorKey.value === "resetPassword.passwordsNotMatch"
);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const submit = async () => {
	errorKey.value = null;
	successKey.value = null;

	if (!token) {
		errorKey.value = "resetPassword.missingToken";
		return;
	}

	if (!password.value || !confirmPassword.value) {
		errorKey.value = "validation.requiredFields";
		return;
	}

	if (!passwordRegex.test(password.value)) {
		errorKey.value = "resetPassword.passwordPolicy";
		return;
	}

	if (password.value !== confirmPassword.value) {
		errorKey.value = "resetPassword.passwordsNotMatch";
		return;
	}

	try {
		loading.value = true;

		await api.post("/auth/reset-password", {
			token,
			password: password.value,
		});

		successKey.value = "resetPassword.success";

		setTimeout(() => {
			router.push("/login");
		}, 2400);
	} catch (err) {
		const message = err.response?.data?.message;

		if (message === "Nieprawidłowy lub wygasły token") {
			errorKey.value = "resetPassword.invalidOrExpiredToken";
			return;
		}

		if (message === "Nowe hasło nie może być takie samo jak obecne") {
			errorKey.value = "resetPassword.sameAsCurrentPassword";
			return;
		}

		errorKey.value = "resetPassword.error";
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
					{{ t("resetPassword.title") }}
				</h1>

				<p class="text-sm text-gray-500">
					{{ t("resetPassword.subtitle") }}
				</p>
			</div>

			<form @submit.prevent="submit">
				<div class="space-y-5">
					<BaseInput
						v-model="password"
						:type="showPassword ? 'text' : 'password'"
						:label="t('resetPassword.password')"
						:error="passwordHasError"
						required>
						<template #right>
							<button
								type="button"
								:aria-label="
									showPassword
										? t('resetPassword.hidePassword')
										: t('resetPassword.showPassword')
								"
								@click="showPassword = !showPassword"
								class="cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</template>
					</BaseInput>

					<BaseInput
						v-model="confirmPassword"
						:type="showConfirmPassword ? 'text' : 'password'"
						:label="t('resetPassword.confirmPassword')"
						:error="confirmPasswordHasError"
						required>
						<template #right>
							<button
								type="button"
								:aria-label="
									showConfirmPassword
										? t('resetPassword.hidePassword')
										: t('resetPassword.showPassword')
								"
								@click="showConfirmPassword = !showConfirmPassword"
								class="cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showConfirmPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</template>
					</BaseInput>

					<BaseAlert type="info" :message="t('resetPassword.passwordPolicy')" />
					<BaseAlert v-if="errorKey" type="error" :message="t(errorKey)" />

					<BaseAlert
						v-if="successKey"
						type="success"
						:message="t(successKey)" />

					<BaseButton
						type="submit"
						variant="primary"
						:full-width="true"
						:disabled="loading || Boolean(successKey)">
						{{
							loading ? t("resetPassword.saving") : t("resetPassword.submit")
						}}
					</BaseButton>
				</div>
			</form>
		</div>
	</AuthLayout>
</template>
