<script setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";

import DashboardLayout from "../layouts/DashboardLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import { api } from "../api";
import { useAuthStore } from "../stores/auth";

const { t } = useI18n();

const users = ref([]);
const search = ref("");

const error = ref(null);
const success = ref(null);
const loading = ref(false);

const showDeleteModal = ref(false);
const userToDelete = ref(null);

const showResetPasswordModal = ref(false);
const userToResetPassword = ref(null);

const showEditModal = ref(false);

const auth = useAuthStore();

const inputClass =
	"w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-hidden";

const inputErrorClass =
	"w-full rounded-lg border border-red-500 px-4 py-2 text-sm text-gray-800 transition focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-hidden";

const form = ref({
	email: "",
	firstName: "",
	lastName: "",
	phone: "",
	jobTitle: "",
	role: "USER",
	preferredLanguage: "pl",
});

const editForm = ref({
	id: null,
	firstName: "",
	lastName: "",
	phone: "",
	jobTitle: "",
	role: "USER",
	preferredLanguage: "pl",
});

const clearMessages = () => {
	error.value = null;
	success.value = null;
};

const showSuccess = message => {
	success.value = message;

	setTimeout(() => {
		success.value = null;
	}, 3000);
};

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

const loadUsers = async () => {
	const res = await api.get("/users");
	users.value = res.data;
};

const createUser = async () => {
	clearMessages();

	if (!form.value.email) {
		error.value = t("validation.requiredEmail");
		return;
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(form.value.email)) {
		error.value = t("validation.invalidEmail");
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
			preferredLanguage: "pl",
		};

		showSuccess(t("users.created"));

		await loadUsers();
	} catch (err) {
		error.value = err.response?.data?.message || t("users.createError");
	} finally {
		loading.value = false;
	}
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

		showSuccess(t("users.deleted"));
		closeDeleteModal();
	} catch (err) {
		error.value = err.response?.data?.message || t("users.deleteError");
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

		showSuccess(t("users.resetSent"));

		await loadUsers();

		closeResetPasswordModal();
	} catch (err) {
		error.value = err.response?.data?.message || t("users.resetError");
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
		preferredLanguage: user.preferredLanguage || "pl",
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
			preferredLanguage: editForm.value.preferredLanguage,
		});

		showSuccess(t("users.updated"));

		await loadUsers();

		closeEditModal();
	} catch (err) {
		error.value = err.response?.data?.message || t("users.updateError");
	} finally {
		loading.value = false;
	}
};

onMounted(loadUsers);
</script>

<template>
	<DashboardLayout>
		<div class="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
			<h2 class="mb-2 text-lg font-semibold text-gray-900">
				{{ t("users.createTitle") }}
			</h2>

			<p class="mb-3 text-sm text-gray-500">
				{{ t("users.createSubtitle") }}
			</p>

			<BaseAlert v-if="error" type="error" :message="error" class="mb-4" />

			<BaseAlert
				v-if="success"
				type="success"
				:message="success"
				class="mb-4" />

			<form
				@submit.prevent="createUser"
				novalidate
				class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				<input
					v-model="form.email"
					type="text"
					:placeholder="t('users.email')"
					:class="error ? inputErrorClass : inputClass" />

				<input
					v-model="form.firstName"
					:placeholder="t('users.firstName')"
					:class="inputClass" />

				<input
					v-model="form.lastName"
					:placeholder="t('users.lastName')"
					:class="inputClass" />

				<input
					v-model="form.phone"
					:placeholder="t('users.phone')"
					:class="inputClass" />

				<input
					v-model="form.jobTitle"
					:placeholder="t('users.jobTitle')"
					:class="inputClass" />

				<select v-model="form.role" :class="inputClass">
					<option value="USER">USER</option>
					<option value="ADMIN">ADMIN</option>
				</select>

				<select v-model="form.preferredLanguage" :class="inputClass">
					<option value="pl">Polski</option>
					<option value="en">English</option>
				</select>

				<BaseButton type="submit" variant="primary" :disabled="loading">
					{{ loading ? t("users.adding") : t("users.add") }}
				</BaseButton>
			</form>
		</div>

		<div class="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
			<h1 class="text-2xl font-semibold text-gray-900">
				{{ t("users.title") }}
			</h1>

			<div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
				<input
					v-model="search"
					type="text"
					:placeholder="t('users.searchPlaceholder')"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-800 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-hidden md:max-w-sm" />

				<BaseButton type="button" variant="secondary" @click="search = ''">
					{{ t("users.clearFilter") }}
				</BaseButton>
			</div>

			<p class="mt-3 text-sm text-gray-500">
				{{ t("users.found", { count: filteredUsers.length }) }}
			</p>
		</div>

		<div
			class="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-5">
			<div class="custom-scrollbar max-h-[600px] overflow-auto pr-2">
				<table class="mb-2 w-full min-w-[900px] text-left text-sm">
					<thead class="sticky top-0 z-10 border-b bg-white text-gray-500">
						<tr>
							<th class="py-3">{{ t("users.email") }}</th>
							<th>{{ t("users.firstName") }}</th>
							<th>{{ t("users.lastName") }}</th>
							<th>{{ t("users.phone") }}</th>
							<th>{{ t("users.jobTitle") }}</th>
							<th>{{ t("users.role") }}</th>
							<th>{{ t("users.language") }}</th>
							<th>{{ t("users.notifications") }}</th>
							<th>{{ t("users.lastLogin") }}</th>
							<th>{{ t("users.actions") }}</th>
						</tr>
					</thead>

					<tbody>
						<tr v-if="filteredUsers.length === 0">
							<td colspan="10" class="py-6 text-center text-gray-500">
								{{ t("users.noResults") }}
							</td>
						</tr>

						<tr
							v-for="user in filteredUsers"
							:key="user.id"
							class="border-b hover:bg-gray-50">
							<td class="py-3">{{ user.email }}</td>
							<td>{{ user.firstName || "-" }}</td>
							<td>{{ user.lastName || "-" }}</td>
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
								{{ user.preferredLanguage?.toUpperCase() || "PL" }}
							</td>

							<td>
								<span
									v-if="user.notificationsEnabled"
									class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
									{{ t("users.enabled") }}
								</span>

								<span
									v-else
									class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
									{{ t("users.disabled") }}
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
										{{ t("users.edit") }}
									</button>

									<button
										v-if="canResetPassword(user)"
										@click="openResetPasswordModal(user)"
										class="cursor-pointer rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 hover:text-amber-800">
										{{ t("users.resetPassword") }}
									</button>

									<button
										v-if="canDeleteUser(user)"
										@click="openDeleteModal(user)"
										class="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100 hover:text-red-700">
										{{ t("users.delete") }}
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
				<h3 class="text-lg font-semibold text-gray-900">
					{{ t("users.deleteTitle") }}
				</h3>

				<p class="mt-2 text-sm text-gray-500">
					{{ t("users.deleteQuestion") }}
					<span class="font-medium text-gray-900">
						{{ userToDelete?.email }}
					</span>
					?
				</p>

				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="closeDeleteModal"
						class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100">
						{{ t("users.cancel") }}
					</button>

					<button
						type="button"
						@click="confirmDeleteUser"
						:disabled="loading"
						class="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
						{{ loading ? t("users.deleting") : t("users.delete") }}
					</button>
				</div>
			</div>
		</div>

		<div
			v-if="showEditModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div class="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
				<h3 class="text-lg font-semibold text-gray-900">
					{{ t("users.editTitle") }}
				</h3>

				<div class="mt-5 grid gap-4 md:grid-cols-2">
					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							{{ t("users.firstName") }}
						</label>

						<input v-model="editForm.firstName" :class="inputClass" />
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							{{ t("users.lastName") }}
						</label>

						<input v-model="editForm.lastName" :class="inputClass" />
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							{{ t("users.phone") }}
						</label>

						<input v-model="editForm.phone" :class="inputClass" />
					</div>

					<div>
						<label class="mb-1 block text-sm font-medium text-gray-700">
							{{ t("users.jobTitle") }}
						</label>

						<input v-model="editForm.jobTitle" :class="inputClass" />
					</div>

					<div class="md:col-span-2">
						<label class="mb-1 block text-sm font-medium text-gray-700">
							{{ t("users.role") }}
						</label>

						<select v-model="editForm.role" :class="inputClass">
							<option value="USER">USER</option>
							<option value="ADMIN">ADMIN</option>
						</select>
					</div>

					<div class="md:col-span-2">
						<label class="mb-1 block text-sm font-medium text-gray-700">
							{{ t("users.language") }}
						</label>

						<select v-model="editForm.preferredLanguage" :class="inputClass">
							<option value="pl">Polski</option>
							<option value="en">English</option>
						</select>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="closeEditModal"
						class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100">
						{{ t("users.cancel") }}
					</button>

					<button
						type="button"
						@click="updateUser"
						:disabled="loading"
						class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
						{{ loading ? t("users.saving") : t("users.saveChanges") }}
					</button>
				</div>
			</div>
		</div>

		<div
			v-if="showResetPasswordModal"
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
			<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h3 class="text-lg font-semibold text-gray-900">
					{{ t("users.resetTitle") }}
				</h3>

				<p class="mt-2 text-sm text-gray-500">
					{{ t("users.resetQuestion") }}
					<span class="font-medium text-gray-900">
						{{ userToResetPassword?.email }}
					</span>
					?
				</p>

				<p class="mt-3 text-sm text-amber-700">
					{{ t("users.resetInfo") }}
				</p>

				<div class="mt-6 flex justify-end gap-3">
					<button
						type="button"
						@click="closeResetPasswordModal"
						class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100">
						{{ t("users.cancel") }}
					</button>

					<button
						type="button"
						@click="confirmResetPassword"
						:disabled="loading"
						class="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 text-sm text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">
						{{ loading ? t("users.resetting") : t("users.resetPassword") }}
					</button>
				</div>
			</div>
		</div>
	</DashboardLayout>
</template>
