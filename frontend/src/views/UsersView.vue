<script setup>
import { ref, onMounted, computed } from "vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import { api } from "../api";
import { useAuthStore } from "../stores/auth";

const users = ref([]);

const search = ref("");

const error = ref(null);
const success = ref(null);

const clearMessages = () => {
	error.value = null;
	success.value = null;
};

const loading = ref(false);

const showDeleteModal = ref(false);
const userToDelete = ref(null);

const showResetPasswordModal = ref(false);
const userToResetPassword = ref(null);

const showEditModal = ref(false);

const editForm = ref({
	id: null,
	firstName: "",
	lastName: "",
	phone: "",
	jobTitle: "",
	role: "USER",
});

const auth = useAuthStore();

const canDeleteUser = user => {
	if (user.id === auth.user?.userId) return false;

	if (user.isSuperAdmin) return false;

	if (user.role === "ADMIN" && !auth.user?.isSuperAdmin) {
		return false;
	}

	return true;
};

const canEditUser = user => {
	if (user.id === auth.user?.userId) return false;

	if (user.isSuperAdmin) return false;

	if (user.role === "ADMIN" && !auth.user?.isSuperAdmin) {
		return false;
	}

	return true;
};

const canResetPassword = user => {
	if (user.id === auth.user?.userId) return false;

	if (user.isSuperAdmin) return false;

	return true;
};

const form = ref({
	email: "",
	firstName: "",
	lastName: "",
	phone: "",
	jobTitle: "",
	role: "USER",
});

const createUser = async () => {
	clearMessages();

	if (!form.value.email) {
		error.value = "Email jest wymagany";
		return;
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(form.value.email)) {
		error.value = "Podaj poprawny adres email";
		return;
	}

	loading.value = true;

	try {
		await api.post("/users", form.value);

		form.value = {
			email: "",
			firstName: "",
			lastName: "",
			phone: "",
			jobTitle: "",
			role: "USER",
		};

		success.value = "Użytkownik został dodany";

		setTimeout(() => {
			success.value = null;
		}, 3000);

		await loadUsers();
	} catch (err) {
		error.value =
			err.response?.data?.message || "Nie udało się dodać użytkownika";
	} finally {
		loading.value = false;
	}
};

const loadUsers = async () => {
	const res = await api.get("/users");
	users.value = res.data;
};

const filteredUsers = computed(() => {
	const query = search.value.toLowerCase();

	return users.value.filter(user => {
		return (
			user.email?.toLowerCase().includes(query) ||
			user.firstName?.toLowerCase().includes(query) ||
			user.lastName?.toLowerCase().includes(query)
		);
	});
});

const openDeleteModal = user => {
	userToDelete.value = user;
	showDeleteModal.value = true;
};

const closeDeleteModal = () => {
	userToDelete.value = null;
	showDeleteModal.value = false;
};

const confirmDeleteUser = async () => {
	if (!userToDelete.value) return;

	clearMessages();

	loading.value = true;

	try {
		await api.delete(`/users/${userToDelete.value.id}`);

		await loadUsers();

		success.value = "Użytkownik został usunięty";

		setTimeout(() => {
			success.value = null;
		}, 3000);

		closeDeleteModal();
	} catch (err) {
		error.value =
			err.response?.data?.message || "Nie udało się usunąć użytkownika";
	} finally {
		loading.value = false;
	}
};

const openResetPasswordModal = user => {
	userToResetPassword.value = user;
	showResetPasswordModal.value = true;
};

const closeResetPasswordModal = () => {
	userToResetPassword.value = null;
	showResetPasswordModal.value = false;
};

const confirmResetPassword = async () => {
	if (!userToResetPassword.value) return;

	clearMessages();

	loading.value = true;

	try {
		await api.post(`/users/${userToResetPassword.value.id}/reset-password`);

		success.value =
			"Nowe hasło tymczasowe zostało wysłane na email użytkownika";

		setTimeout(() => {
			success.value = null;
		}, 3000);

		await loadUsers();

		closeResetPasswordModal();
	} catch (err) {
		error.value =
			err.response?.data?.message || "Nie udało się zresetować hasła";
	} finally {
		loading.value = false;
	}
};

const openEditModal = user => {
	editForm.value = {
		id: user.id,
		firstName: user.firstName || "",
		lastName: user.lastName || "",
		phone: user.phone || "",
		jobTitle: user.jobTitle || "",
		role: user.role || "USER",
	};

	showEditModal.value = true;
};

const closeEditModal = () => {
	showEditModal.value = false;
};

const updateUser = async () => {
	clearMessages();

	loading.value = true;

	try {
		await api.patch(`/users/${editForm.value.id}`, {
			firstName: editForm.value.firstName,
			lastName: editForm.value.lastName,
			phone: editForm.value.phone,
			jobTitle: editForm.value.jobTitle,
			role: editForm.value.role,
		});

		success.value = "Użytkownik został zaktualizowany";

		setTimeout(() => {
			success.value = null;
		}, 3000);

		await loadUsers();

		closeEditModal();
	} catch (err) {
		error.value =
			err.response?.data?.message || "Nie udało się zaktualizować użytkownika";
	} finally {
		loading.value = false;
	}
};

onMounted(loadUsers);
</script>

<template>
	<DashboardLayout>
		<div class="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">
				Dodaj użytkownika
			</h2>
			<p class="mb-4 text-sm text-gray-500">
				Hasło tymczasowe zostanie wygenerowane automatycznie i wysłane na email
				użytkownika.
			</p>
			<p v-if="error" class="mb-4 text-sm text-red-600">
				{{ error }}
			</p>

			<p v-if="success" class="mb-4 text-sm text-green-600">
				{{ success }}
			</p>
			<form
				@submit.prevent="createUser"
				novalidate
				class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				<input
					v-model="form.email"
					type="text"
					placeholder="Email"
					:class="[
						'rounded-lg border px-4 py-2',
						error ? 'border-red-500 focus:border-red-500' : 'border-gray-300',
					]" />

				<input
					v-model="form.firstName"
					placeholder="Imię"
					class="rounded-lg border border-gray-300 px-4 py-2" />

				<input
					v-model="form.lastName"
					placeholder="Nazwisko"
					class="rounded-lg border border-gray-300 px-4 py-2" />

				<input
					v-model="form.phone"
					placeholder="Telefon"
					class="rounded-lg border border-gray-300 px-4 py-2" />

				<input
					v-model="form.jobTitle"
					placeholder="Stanowisko"
					class="rounded-lg border border-gray-300 px-4 py-2" />

				<select
					v-model="form.role"
					class="rounded-lg border border-gray-300 px-4 py-2">
					<option value="USER">USER</option>
					<option value="ADMIN">ADMIN</option>
				</select>

				<button
					type="submit"
					:disabled="loading"
					class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
					{{ loading ? "Dodawanie..." : "Dodaj użytkownika" }}
				</button>
			</form>
		</div>

		<div class="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
			<h1 class="text-2xl font-semibold text-gray-900">Użytkownicy</h1>

			<div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
				<input
					v-model="search"
					type="text"
					placeholder="Szukaj użytkownika..."
					class="w-full rounded-lg border border-gray-300 px-4 py-2 md:max-w-sm" />

				<button
					@click="search = ''"
					type="button"
					class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
					Wyczyść filtr
				</button>
			</div>

			<p class="mt-3 text-sm text-gray-500">
				Znaleziono użytkowników: {{ filteredUsers.length }}
			</p>
			<p v-if="error" class="mt-3 text-sm text-red-600">
				{{ error }}
			</p>

			<p v-if="success" class="mt-3 text-sm text-green-600">
				{{ success }}
			</p>
		</div>

		<div
			class="rounded-2xl border border-gray-200 bg-white p-6 overflow-x-auto">
			<div class="max-h-[600px] overflow-auto pr-2 custom-scrollbar">
				<table class="min-w-[900px] w-full text-sm text-left mb-2">
					<thead class="sticky top-0 z-10 border-b bg-white text-gray-500">
						<tr>
							<th class="py-3">Email</th>
							<th>Imię</th>
							<th>Nazwisko</th>
							<th>Telefon</th>
							<th>Stanowisko</th>
							<th>Rola</th>
							<th>Powiadomienia</th>
							<th>Ostatnie logowanie</th>
							<th>Akcje</th>
						</tr>
					</thead>

					<tbody>
						<tr v-if="filteredUsers.length === 0">
							<td colspan="9" class="py-6 text-center text-gray-500">
								Nie znaleziono użytkowników
							</td>
						</tr>
						<tr
							v-for="user in filteredUsers"
							:key="user.id"
							class="border-b hover:bg-gray-50">
							<td class="py-3">{{ user.email }}</td>
							<td>{{ user.firstName }}</td>
							<td>{{ user.lastName }}</td>
							<td>{{ user.phone || "-" }}</td>
							<td>{{ user.jobTitle || "-" }}</td>
							<td>
								<span
									v-if="user.isSuperAdmin"
									class="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
									SUPER ADMIN
								</span>

								<span
									v-else-if="user.role === 'ADMIN'"
									class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
									ADMIN
								</span>

								<span
									v-else
									class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
									USER
								</span>
							</td>
							<td>
								<span
									v-if="user.notificationsEnabled"
									class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
									WŁĄCZONE
								</span>

								<span
									v-else
									class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
									WYŁĄCZONE
								</span>
							</td>
							<td>
								{{
									user.lastLoginAt
										? new Date(user.lastLoginAt).toLocaleString()
										: "-"
								}}
							</td>

							<td>
								<div class="flex items-center gap-2">
									<button
										v-if="canEditUser(user)"
										@click="openEditModal(user)"
										class="cursor-pointer rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 hover:text-blue-700">
										Edytuj
									</button>

									<button
										v-if="canResetPassword(user)"
										@click="openResetPasswordModal(user)"
										class="cursor-pointer rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 hover:text-amber-800">
										Resetuj hasło
									</button>

									<button
										v-if="canDeleteUser(user)"
										@click="openDeleteModal(user)"
										class="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700">
										Usuń
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div
			v-if="showDeleteModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h3 class="text-lg font-semibold text-gray-900">Usunąć użytkownika?</h3>

				<p class="mt-2 text-sm text-gray-500">
					Czy na pewno chcesz usunąć użytkownika
					<span class="font-medium text-gray-900">
						{{ userToDelete?.email }} </span
					>?
				</p>

				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="closeDeleteModal"
						class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
						Anuluj
					</button>

					<button
						type="button"
						@click="confirmDeleteUser"
						:disabled="loading"
						class="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
						{{ loading ? "Usuwanie..." : "Usuń" }}
					</button>
				</div>
			</div>
		</div>
		<div
			v-if="showEditModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
				<h3 class="text-lg font-semibold text-gray-900">Edytuj użytkownika</h3>

				<div class="mt-5 grid gap-4 md:grid-cols-2">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							Imię
						</label>

						<input
							v-model="editForm.firstName"
							class="w-full rounded-lg border border-gray-300 px-4 py-2" />
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							Nazwisko
						</label>

						<input
							v-model="editForm.lastName"
							class="w-full rounded-lg border border-gray-300 px-4 py-2" />
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							Telefon
						</label>

						<input
							v-model="editForm.phone"
							class="w-full rounded-lg border border-gray-300 px-4 py-2" />
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							Stanowisko
						</label>

						<input
							v-model="editForm.jobTitle"
							class="w-full rounded-lg border border-gray-300 px-4 py-2" />
					</div>

					<div class="md:col-span-2">
						<label class="mb-1 block text-sm font-medium text-gray-700">
							Rola
						</label>

						<select
							v-model="editForm.role"
							class="w-full rounded-lg border border-gray-300 px-4 py-2">
							<option value="USER">USER</option>
							<option value="ADMIN">ADMIN</option>
						</select>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="closeEditModal"
						class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
						Anuluj
					</button>

					<button
						type="button"
						@click="updateUser"
						:disabled="loading"
						class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
						{{ loading ? "Zapisywanie..." : "Zapisz zmiany" }}
					</button>
				</div>
			</div>
		</div>
		<div
			v-if="showResetPasswordModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h3 class="text-lg font-semibold text-gray-900">Resetować hasło?</h3>

				<p class="mt-2 text-sm text-gray-500">
					Czy na pewno chcesz wygenerować nowe hasło tymczasowe dla użytkownika
					<span class="font-medium text-gray-900">
						{{ userToResetPassword?.email }} </span
					>?
				</p>

				<p class="mt-3 text-sm text-amber-700">
					Użytkownik otrzyma email z nowym hasłem i będzie musiał zmienić je po
					zalogowaniu.
				</p>

				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="closeResetPasswordModal"
						class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
						Anuluj
					</button>

					<button
						type="button"
						@click="confirmResetPassword"
						:disabled="loading"
						class="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
						{{ loading ? "Resetowanie..." : "Resetuj hasło" }}
					</button>
				</div>
			</div>
		</div>
	</DashboardLayout>
</template>
