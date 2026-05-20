<script setup>
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Eye, EyeOff } from "lucide-vue-next";

import { useAuthStore } from "../stores/auth";
import AuthLayout from "../layouts/AuthLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import LanguageSwitcher from "../components/common/LanguageSwitcher.vue";

const { t } = useI18n();

const email = ref("");
const password = ref("");
const emailErrorKey = ref(null);
const passwordErrorKey = ref(null);
const attemptsLeft = ref(null);
const showPassword = ref(false);

const router = useRouter();
const auth = useAuthStore();

const emailHasError = computed(() => Boolean(emailErrorKey.value));
const passwordHasError = computed(() => Boolean(passwordErrorKey.value));

const isValidEmail = value => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const loading = ref(false);

const submit = async () => {
	emailErrorKey.value = null;
	passwordErrorKey.value = null;
	attemptsLeft.value = null;

	if (!email.value) {
		emailErrorKey.value = "validation.requiredEmail";
		return;
	}

	if (!isValidEmail(email.value)) {
		emailErrorKey.value = "validation.invalidEmail";
		return;
	}

	if (!password.value) {
		passwordErrorKey.value = "validation.requiredPassword";
		return;
	}

	try {
		loading.value = true;

		await auth.login(email.value, password.value);

		if (auth.mustChangePassword) {
			router.push("/change-password");
		} else {
			router.push("/dashboard");
		}
	} catch (err) {
		const response = err.response?.data;

		if (response?.code === "ACCOUNT_LOCKED") {
			passwordErrorKey.value = "login.accountLocked";
			return;
		}

		if (response?.code === "INVALID_CREDENTIALS") {
			if (response.attemptsLeft !== undefined) {
				attemptsLeft.value = response.attemptsLeft;
				passwordErrorKey.value = "login.invalidCredentialsWithAttempts";
				return;
			}

			passwordErrorKey.value = "login.invalidCredentials";
			return;
		}

		passwordErrorKey.value = "login.invalidCredentials";
	} finally {
		loading.value = false;
	}
};
</script>

<template>
	<AuthLayout>
		<div>
			<div class="mb-5 sm:mb-8">
				<h1
					class="font-heading mb-2 text-xl font-semibold text-gray-800 sm:text-title-md">
					{{ t("login.title") }}
				</h1>

				<p class="text-sm text-gray-500">
					{{ t("login.subtitle") }}
				</p>
			</div>

			<form @submit.prevent="submit">
				<div class="space-y-5">
					<BaseInput
						v-model="email"
						type="email"
						:label="t('login.email')"
						:placeholder="t('login.emailPlaceholder')"
						:error="emailHasError"
						required />

					<BaseInput
						v-model="password"
						:type="showPassword ? 'text' : 'password'"
						:label="t('login.password')"
						:placeholder="t('login.passwordPlaceholder')"
						:error="passwordHasError"
						required>
						<template #right>
							<button
								type="button"
								:aria-label="
									showPassword
										? t('login.hidePassword')
										: t('login.showPassword')
								"
								@click="showPassword = !showPassword"
								class="cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</template>
					</BaseInput>

					<BaseAlert
						v-if="emailErrorKey || passwordErrorKey"
						type="error"
						:message="
							passwordErrorKey === 'login.invalidCredentialsWithAttempts'
								? t(passwordErrorKey, { count: attemptsLeft })
								: t(emailErrorKey || passwordErrorKey)
						" />

					<div class="flex items-center justify-end">
						<RouterLink
							to="/forgot-password"
							class="text-sm font-medium text-blue-600 hover:text-blue-700">
							{{ t("login.forgotPassword") }}
						</RouterLink>
					</div>

					<BaseButton
						type="submit"
						variant="primary"
						:full-width="true"
						:disabled="loading">
						{{ loading ? t("login.loggingIn") : t("login.submit") }}
					</BaseButton>

					<p class="text-center text-sm text-gray-500">
						{{ t("login.noAccount") }}
					</p>
				</div>
			</form>

			<div class="mt-8 flex justify-center">
				<LanguageSwitcher />
			</div>
		</div>
	</AuthLayout>
</template>
