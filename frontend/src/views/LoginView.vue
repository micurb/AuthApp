<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("");
const password = ref("");
const error = ref(null);

const router = useRouter();
const auth = useAuthStore();

const submit = async () => {
	error.value = null;

	try {
		await auth.login(email.value, password.value);
		router.push("/dashboard");
	} catch (err) {
		error.value = "Nieprawidłowy email lub hasło";
	}
};
</script>

<template>
	<div class="relative z-1 bg-white p-6 sm:p-0">
		<div
			class="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row">
			<div class="flex w-full flex-1 flex-col lg:w-1/2">
				<div
					class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
					<div>
						<div class="mb-5 sm:mb-8">
							<h1
								class="font-heading text-xl sm:text-title-md mb-2 font-semibold text-gray-800">
								{{ $t("login.title") }}
							</h1>
							<p class="text-sm text-gray-500">{{ $t("login.subtitle") }}</p>
						</div>
						<div>
							<form @submit.prevent="submit">
								<div class="space-y-5">
									<div>
										<label
											class="font-heading mb-1.5 block text-sm font-medium text-gray-700"
											>{{ $t("login.email") }}
											<span class="text-error-500">*</span>
										</label>
										<input
											v-model="email"
											type="email"
											name="email"
											id="email"
											placeholder="info@gmail.com"
											class="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden" />
									</div>
									<div>
										<label
											class="font-heading mb-1.5 block text-sm font-medium text-gray-700"
											>{{ $t("login.password") }}
											<span class="text-error-500">*</span>
										</label>
										<input
											v-model="password"
											type="password"
											placeholder="Enter your password"
											class="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden" />
									</div>
									<div>
										<p v-if="error">{{ error }}</p>
									</div>
									<div class="flex items-center justify-end">
										<RouterLink
											to="/forgot-password"
											class="text-sm font-medium text-blue-600 hover:text-blue-700">
											Przypomnij hasło
										</RouterLink>
									</div>
									<div>
										<button
											type="submit"
											class="bg-blue-600 hover:bg-blue-700 cursor-pointer flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white transition">
											{{ $t("login.submit") }}
										</button>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
			<div
				class="relative hidden h-full w-full items-center lg:grid lg:w-1/2 bg-gray-100">
				<div class="text-center">
					<h1
						class="font-heading text-5xl font-semibold text-gray-800 mb-6 tracking-wide">
						{{ $t("app.name") }}
					</h1>

					<div class="mt-8 flex justify-center">
						<img
							src="/logo.png"
							alt="Logo"
							class="h-10 w-auto object-contain" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
