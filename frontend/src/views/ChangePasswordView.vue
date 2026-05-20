<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Eye, EyeOff } from "lucide-vue-next";

import { api } from "../api";
import AuthLayout from "../layouts/AuthLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";

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

const currentPasswordHasError = computed(
	() =>
		errorKey.value === "validation.requiredFields" ||
		errorKey.value === "changePassword.error"
);

const newPasswordHasError = computed(
	() =>
		errorKey.value === "validation.requiredFields" ||
		errorKey.value === "changePassword.passwordPolicy" ||
		errorKey.value === "changePassword.passwordsNotMatch"
);

const confirmPasswordHasError = computed(
	() =>
		errorKey.value === "validation.requiredFields" ||
		errorKey.value === "changePassword.passwordsNotMatch"
);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

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

		router.push({
			path: "/profile",
			query: {
				passwordChanged: "1",
			},
		});
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
					<BaseInput
						v-model="currentPassword"
						:type="showCurrentPassword ? 'text' : 'password'"
						:label="t('changePassword.currentPassword')"
						:error="currentPasswordHasError"
						required>
						<template #right>
							<button
								type="button"
								:aria-label="
									showCurrentPassword
										? t('changePassword.hidePassword')
										: t('changePassword.showPassword')
								"
								@click="showCurrentPassword = !showCurrentPassword"
								class="cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showCurrentPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</template>
					</BaseInput>

					<BaseInput
						v-model="newPassword"
						:type="showNewPassword ? 'text' : 'password'"
						:label="t('changePassword.newPassword')"
						:error="newPasswordHasError"
						required>
						<template #right>
							<button
								type="button"
								:aria-label="
									showNewPassword
										? t('changePassword.hidePassword')
										: t('changePassword.showPassword')
								"
								@click="showNewPassword = !showNewPassword"
								class="cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showNewPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</template>
					</BaseInput>

					<BaseInput
						v-model="confirmPassword"
						:type="showConfirmPassword ? 'text' : 'password'"
						:label="t('changePassword.confirmPassword')"
						:error="confirmPasswordHasError"
						required>
						<template #right>
							<button
								type="button"
								:aria-label="
									showConfirmPassword
										? t('changePassword.hidePassword')
										: t('changePassword.showPassword')
								"
								@click="showConfirmPassword = !showConfirmPassword"
								class="cursor-pointer text-gray-500 hover:text-gray-800">
								<Eye v-if="!showConfirmPassword" class="h-5 w-5" />
								<EyeOff v-else class="h-5 w-5" />
							</button>
						</template>
					</BaseInput>

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
