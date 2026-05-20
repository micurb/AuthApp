<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useI18n } from "vue-i18n";

import DashboardLayout from "../layouts/DashboardLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseInput from "../components/ui/BaseInput.vue";
import BaseSelect from "../components/ui/BaseSelect.vue";
import BaseModal from "../components/ui/BaseModal.vue";
import BaseBadge from "../components/ui/BaseBadge.vue";
import BaseCard from "../components/ui/BaseCard.vue";
import { api } from "../api";
import { useAuthStore } from "../stores/auth";

const { t } = useI18n();

const users = ref([]);
const search = ref("");

const error = ref(null);
const success = ref(null);
const createLoading = ref(false);
const editLoading = ref(false);
const deleteLoading = ref(false);
const resetLoading = ref(false);

const editError = ref(null);

const fieldErrors = ref({
	email: null,
	phone: null,
});

const showDeleteModal = ref(false);
const userToDelete = ref(null);

const showResetPasswordModal = ref(false);
const userToResetPassword = ref(null);

const showEditModal = ref(false);

const auth = useAuthStore();

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

const roleOptions = [
	{ value: "USER", label: "USER" },
	{ value: "ADMIN", label: "ADMIN" },
];

const languageOptions = [
	{ value: "pl", label: "Polski" },
	{ value: "en", label: "English" },
];

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const emailHasError = computed(() => {
	return Boolean(fieldErrors.value.email);
});

const phoneHasError = computed(() => {
	return Boolean(fieldErrors.value.phone);
});

const clearMessages = () => {
	error.value = null;
	success.value = null;

	fieldErrors.value = {
		email: null,
		phone: null,
	};
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

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!form.value.email) {
		fieldErrors.value.email = t("validation.requiredEmail");
	} else if (!emailRegex.test(form.value.email)) {
		fieldErrors.value.email = t("validation.invalidEmail");
	}

	if (form.value.phone && !phoneRegex.test(form.value.phone)) {
		fieldErrors.value.phone = t("validation.invalidPhone");
	}

	if (fieldErrors.value.email || fieldErrors.value.phone) {
		return;
	}

	createLoading.value = true;

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
		const message = err.response?.data?.message || t("users.createError");

		if (message.toLowerCase().includes("email")) {
			fieldErrors.value.email = message;
		} else {
			error.value = message;
		}
	} finally {
		createLoading.value = false;
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

const currentPage = ref(1);
const perPage = 10;

const totalPages = computed(() => {
	return Math.max(1, Math.ceil(filteredUsers.value.length / perPage));
});

const paginatedUsers = computed(() => {
	const start = (currentPage.value - 1) * perPage;
	const end = start + perPage;

	return filteredUsers.value.slice(start, end);
});

watch(search, () => {
	currentPage.value = 1;
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
	deleteLoading.value = true;

	try {
		await api.delete(`/users/${userToDelete.value.id}`);

		await loadUsers();

		if (currentPage.value > totalPages.value) {
			currentPage.value = totalPages.value;
		}

		showSuccess(t("users.deleted"));
		closeDeleteModal();
	} catch (err) {
		error.value = err.response?.data?.message || t("users.deleteError");
	} finally {
		deleteLoading.value = false;
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
	resetLoading.value = true;

	try {
		await api.post(`/users/${userToResetPassword.value.id}/reset-password`);

		showSuccess(t("users.resetSent"));

		await loadUsers();

		closeResetPasswordModal();
	} catch (err) {
		error.value = err.response?.data?.message || t("users.resetError");
	} finally {
		resetLoading.value = false;
	}
};

const openEditModal = user => {
	editError.value = null;

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
	editError.value = null;
	showEditModal.value = false;
};

const updateUser = async () => {
	clearMessages();
	editLoading.value = true;

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
		editError.value = err.response?.data?.message || t("users.updateError");
	} finally {
		editLoading.value = false;
	}
};

onMounted(loadUsers);
</script>

<template>
	<DashboardLayout>
		<BaseCard class="mb-6">
			<h2 class="mb-2 text-lg font-semibold text-gray-900">
				{{ t("users.createTitle") }}
			</h2>

			<p class="mb-3 text-sm text-gray-500">
				{{ t("users.createSubtitle") }}
			</p>

			<BaseAlert v-if="error" type="error" :message="error" class="mb-4" />

			<BaseAlert
				v-if="fieldErrors.email"
				type="error"
				:message="fieldErrors.email"
				class="mb-4" />

			<BaseAlert
				v-if="fieldErrors.phone"
				type="error"
				:message="fieldErrors.phone"
				class="mb-4" />

			<BaseAlert
				v-if="success"
				type="success"
				:message="success"
				class="mb-4" />

			<form
				@submit.prevent="createUser"
				novalidate
				class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
				<BaseInput
					v-model="form.email"
					type="text"
					:placeholder="t('users.email')"
					:error="emailHasError" />

				<BaseInput
					v-model="form.firstName"
					:placeholder="t('users.firstName')" />

				<BaseInput v-model="form.lastName" :placeholder="t('users.lastName')" />

				<BaseInput
					v-model="form.phone"
					:placeholder="t('users.phone')"
					:error="phoneHasError" />

				<BaseInput v-model="form.jobTitle" :placeholder="t('users.jobTitle')" />

				<BaseSelect v-model="form.role" :options="roleOptions" />

				<BaseSelect
					v-model="form.preferredLanguage"
					:options="languageOptions" />

				<BaseButton type="submit" variant="primary" :disabled="createLoading">
					{{ createLoading ? t("users.adding") : t("users.add") }}
				</BaseButton>
			</form>
		</BaseCard>

		<BaseCard class="mb-6">
			<h1 class="text-2xl font-semibold text-gray-900">
				{{ t("users.title") }}
			</h1>

			<div class="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
				<div class="w-full md:max-w-sm">
					<BaseInput
						v-model="search"
						type="text"
						:placeholder="t('users.searchPlaceholder')" />
				</div>
				<BaseButton type="button" variant="secondary" @click="search = ''">
					{{ t("users.clearFilter") }}
				</BaseButton>
			</div>

			<p class="mt-3 text-sm text-gray-500">
				{{ t("users.found", { count: filteredUsers.length }) }}
			</p>
		</BaseCard>

		<BaseCard padding="none">
			<div
				class="custom-scrollbar relative m-5 max-h-[600px] overflow-auto pr-2">
				<table class="w-full min-w-[900px] border-collapse text-left text-sm">
					<thead
						class="sticky top-0 z-20 border-b border-gray-200 bg-white text-gray-500">
						<tr>
							<th class="bg-white py-3">{{ t("users.email") }}</th>
							<th class="bg-white">{{ t("users.firstName") }}</th>
							<th class="bg-white">{{ t("users.lastName") }}</th>
							<th class="bg-white">{{ t("users.phone") }}</th>
							<th class="bg-white">{{ t("users.jobTitle") }}</th>
							<th class="bg-white">{{ t("users.role") }}</th>
							<th class="bg-white">{{ t("users.language") }}</th>
							<th class="bg-white">{{ t("users.notifications") }}</th>
							<th class="bg-white">{{ t("users.lastLogin") }}</th>
							<th class="bg-white">{{ t("users.actions") }}</th>
						</tr>
					</thead>

					<tbody>
						<tr v-if="filteredUsers.length === 0">
							<td colspan="10" class="py-6 text-center text-gray-500">
								{{ t("users.noResults") }}
							</td>
						</tr>

						<tr
							v-for="user in paginatedUsers"
							:key="user.id"
							class="border-b border-gray-200 hover:bg-gray-50">
							<td class="py-3">{{ user.email }}</td>
							<td>{{ user.firstName || "-" }}</td>
							<td>{{ user.lastName || "-" }}</td>
							<td>{{ user.phone || "-" }}</td>
							<td>{{ user.jobTitle || "-" }}</td>

							<td>
								<BaseBadge v-if="user.isSuperAdmin" variant="purple">
									SUPER ADMIN
								</BaseBadge>

								<BaseBadge v-else-if="user.role === 'ADMIN'" variant="info">
									ADMIN
								</BaseBadge>

								<BaseBadge v-else> USER </BaseBadge>
							</td>

							<td>
								{{ user.preferredLanguage?.toUpperCase() || "PL" }}
							</td>

							<td>
								<BaseBadge v-if="user.notificationsEnabled" variant="success">
									{{ t("users.enabled") }}
								</BaseBadge>

								<BaseBadge v-else>
									{{ t("users.disabled") }}
								</BaseBadge>
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
									<BaseButton
										v-if="canEditUser(user)"
										size="sm"
										variant="secondary"
										@click="openEditModal(user)">
										{{ t("users.edit") }}
									</BaseButton>

									<BaseButton
										v-if="canResetPassword(user)"
										size="sm"
										variant="warning"
										@click="openResetPasswordModal(user)">
										{{ t("users.resetPassword") }}
									</BaseButton>

									<BaseButton
										v-if="canDeleteUser(user)"
										size="sm"
										variant="danger"
										@click="openDeleteModal(user)">
										{{ t("users.delete") }}
									</BaseButton>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<div
					class="flex flex-col items-center justify-between gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row">
					<p class="text-sm text-gray-500">
						{{
							t("users.pagination", {
								page: currentPage,
								total: totalPages,
							})
						}}
					</p>

					<div class="flex items-center gap-2">
						<BaseButton
							type="button"
							size="sm"
							variant="secondary"
							:disabled="currentPage === 1"
							@click="currentPage--">
							{{ t("users.previous") }}
						</BaseButton>

						<BaseButton
							type="button"
							size="sm"
							variant="secondary"
							:disabled="currentPage === totalPages"
							@click="currentPage++">
							{{ t("users.next") }}
						</BaseButton>
					</div>
				</div>
			</div>
		</BaseCard>

		<BaseModal
			v-model="showDeleteModal"
			:title="t('users.deleteTitle')"
			size="sm">
			<p class="text-sm text-gray-500">
				{{ t("users.deleteQuestion") }}

				<span class="font-medium text-gray-900">
					{{ userToDelete?.email }}
				</span>
				?
			</p>

			<template #footer>
				<BaseButton type="button" variant="secondary" @click="closeDeleteModal">
					{{ t("users.cancel") }}
				</BaseButton>

				<BaseButton
					type="button"
					variant="danger"
					:disabled="deleteLoading"
					@click="confirmDeleteUser">
					{{ deleteLoading ? t("users.deleting") : t("users.delete") }}
				</BaseButton>
			</template>
		</BaseModal>

		<BaseModal v-model="showEditModal" :title="t('users.editTitle')" size="md">
			<BaseAlert
				v-if="editError"
				type="error"
				:message="editError"
				class="mb-4" />
			<div class="grid gap-4 md:grid-cols-2">
				<BaseInput v-model="editForm.firstName" :label="t('users.firstName')" />

				<BaseInput v-model="editForm.lastName" :label="t('users.lastName')" />

				<BaseInput v-model="editForm.phone" :label="t('users.phone')" />

				<BaseInput v-model="editForm.jobTitle" :label="t('users.jobTitle')" />

				<BaseSelect
					v-model="editForm.role"
					:label="t('users.role')"
					:options="roleOptions"
					class="md:col-span-2" />

				<BaseSelect
					v-model="editForm.preferredLanguage"
					:label="t('users.language')"
					:options="languageOptions"
					class="md:col-span-2" />
			</div>

			<template #footer>
				<BaseButton type="button" variant="secondary" @click="closeEditModal">
					{{ t("users.cancel") }}
				</BaseButton>

				<BaseButton
					type="button"
					variant="primary"
					:disabled="editLoading"
					@click="updateUser">
					{{ editLoading ? t("users.saving") : t("users.saveChanges") }}
				</BaseButton>
			</template>
		</BaseModal>

		<BaseModal
			v-model="showResetPasswordModal"
			:title="t('users.resetTitle')"
			size="sm">
			<p class="text-sm text-gray-500">
				{{ t("users.resetQuestion") }}

				<span class="font-medium text-gray-900">
					{{ userToResetPassword?.email }}
				</span>
				?
			</p>

			<p class="mt-3 text-sm text-amber-700">
				{{ t("users.resetInfo") }}
			</p>

			<template #footer>
				<BaseButton
					type="button"
					variant="secondary"
					@click="closeResetPasswordModal">
					{{ t("users.cancel") }}
				</BaseButton>

				<BaseButton
					type="button"
					variant="warning"
					:disabled="resetLoading"
					@click="confirmResetPassword">
					{{ resetLoading ? t("users.resetting") : t("users.resetPassword") }}
				</BaseButton>
			</template>
		</BaseModal>
	</DashboardLayout>
</template>
