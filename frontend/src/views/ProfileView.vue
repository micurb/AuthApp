<script setup>
import { ref, onMounted } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { api } from "../api";

const profile = ref(null);

const form = ref({
	firstName: "",
	lastName: "",
	phone: "",
	jobTitle: "",
	notificationsEnabled: true,
});

const message = ref(null);
const error = ref(null);

const phoneHasError = () => {
	if (!error.value) return false;

	return error.value.toLowerCase().includes("telefonu");
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
	};
});

const submit = async () => {
	message.value = null;
	error.value = null;

	try {
		const res = await api.patch("/profile", form.value);

		profile.value = {
			...profile.value,
			...res.data,
		};

		message.value = "Dane profilu zostały zapisane";
	} catch (err) {
		error.value =
		err.response?.data?.message || "Nie udało się zapisać profilu";
	}
};
</script>

<template>
	<DashboardLayout>
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-gray-900">Mój profil</h1>
		</div>

		<!-- Karta podsumowania -->
		<div class="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
			<h2 class="mb-6 text-lg font-semibold text-gray-900">
				Profil użytkownika
			</h2>

			<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-7">
				<div>
					<p class="text-xs text-gray-500">Imię i nazwisko</p>
					<p class="mt-1 font-medium text-gray-900">
						{{ profile?.firstName || "-" }}
						{{ profile?.lastName || "" }}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">Email</p>
					<p class="mt-1 font-medium text-gray-900">
						{{ profile?.email || "-" }}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">Telefon</p>
					<p class="mt-1 font-medium text-gray-900">
						{{ profile?.phone || "-" }}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">Stanowisko</p>
					<p class="mt-1 font-medium text-gray-900">
						{{ profile?.jobTitle || "-" }}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">Rola</p>

					<div class="mt-1">
						<span
							v-if="profile?.isSuperAdmin"
							class="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
							SUPER ADMIN
						</span>

						<span
							v-else-if="profile?.role === 'ADMIN'"
							class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
							ADMIN
						</span>

						<span
							v-else
							class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
							USER
						</span>
					</div>
				</div>

				<div>
					<p class="text-xs text-gray-500">Ostatnie logowanie</p>

					<p class="mt-1 font-medium text-gray-900">
						{{
							profile?.lastLoginAt
								? new Date(profile.lastLoginAt).toLocaleString()
								: "-"
						}}
					</p>
				</div>

				<div>
					<p class="text-xs text-gray-500">Powiadomienia</p>

					<div class="mt-1">
						<span
							v-if="profile?.notificationsEnabled"
							class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
							WŁĄCZONE
						</span>

						<span
							v-else
							class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
							WYŁĄCZONE
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Formularz edycji -->
		<div class="rounded-2xl border border-gray-200 bg-white p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Edytuj dane</h2>

			<p class="mb-4 text-sm text-gray-500">
				Możesz edytować swoje dane profilowe oraz ustawienia powiadomień.
			</p>

			<p v-if="message" class="mb-4 text-sm text-green-600">
				{{ message }}
			</p>

			<p v-if="error" class="mb-4 text-sm text-red-600">
				{{ error }}
			</p>

			<form
				@submit.prevent="submit"
				class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						Imię
					</label>

					<input
						v-model="form.firstName"
						class="w-full rounded-lg border border-gray-300 px-4 py-2" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						Nazwisko
					</label>

					<input
						v-model="form.lastName"
						class="w-full rounded-lg border border-gray-300 px-4 py-2" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						Telefon
					</label>

					<input
						v-model="form.phone"
						:class="[
							'w-full rounded-lg border px-4 py-2',
							phoneHasError()
								? 'border-red-500 focus:border-red-500'
								: 'border-gray-300',
						]" />
				</div>

				<div>
					<label class="mb-1 block text-sm font-medium text-gray-700">
						Stanowisko
					</label>

					<input
						v-model="form.jobTitle"
						class="w-full rounded-lg border border-gray-300 px-4 py-2" />
				</div>

				<label
					class="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700">
					<input
						v-model="form.notificationsEnabled"
						type="checkbox"
						class="h-4 w-4" />

					Otrzymuj powiadomienia email
				</label>

				<div class="flex items-end">
					<button
						type="submit"
						class="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
						Zapisz zmiany
					</button>
				</div>
			</form>
		</div>
	</DashboardLayout>
</template>
