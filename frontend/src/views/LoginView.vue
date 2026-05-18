<script setup>
import { computed, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Eye, EyeOff } from "lucide-vue-next";

import { useAuthStore } from "../stores/auth";
import AuthLayout from "../layouts/AuthLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
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

	try {
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
					<div>
						<label
							class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
							{{ t("login.email") }}
							<span class="text-red-500">*</span>
						</label>

						<input
							v-model="email"
							type="email"
							name="email"
							id="email"
							:placeholder="t('login.emailPlaceholder')"
							:class="[
								'shadow-theme-xs h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition focus:ring-4 focus:outline-hidden',
								emailHasError
									? 'border-red-500 focus:border-red-500 focus:ring-red-100'
									: 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
							]" />
					</div>

					<div>
						<label
							class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
							{{ t("login.password") }}
							<span class="text-red-500">*</span>
						</label>

						<div class="relative">
							<input
								v-model="password"
								:type="showPassword ? 'text' : 'password'"
								:placeholder="t('login.passwordPlaceholder')"
								:class="[
									'shadow-theme-xs h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 transition focus:ring-4 focus:outline-hidden',
									passwordHasError
										? 'border-red-500 focus:border-red-500 focus:ring-red-100'
										: 'border-gray-300 focus:border-blue-500 focus:ring-blue-100',
								]" />

							<button
								type="button"
								:aria-label="
									showPassword
										? t('login.hidePassword')
										: t('login.showPassword')
								"
								@click="showPassword = !showPassword"
								class="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</div>
					</div>

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

					<BaseButton type="submit" variant="primary" :full-width="true">
						{{ t("login.submit") }}
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
