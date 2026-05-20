<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import DashboardLayout from "../layouts/DashboardLayout.vue";
import BaseAlert from "../components/ui/BaseAlert.vue";
import BaseBadge from "../components/ui/BaseBadge.vue";
import BaseButton from "../components/ui/BaseButton.vue";
import BaseCard from "../components/ui/BaseCard.vue";
import BaseInput from "../components/ui/BaseInput.vue";

import { api } from "../api";
import { useAuthStore } from "../stores/auth";

const { t } = useI18n();

const auth = useAuthStore();

const loading = ref(false);
const error = ref("");

const activeTab = ref("my");

const logs = ref([]);

const adminLogs = ref([]);
const adminLoading = ref(false);

const search = ref("");

const currentPage = ref(1);
const totalPages = ref(1);

const isAdmin = computed(() => {
	return auth.user?.role === "ADMIN" || auth.user?.isSuperAdmin;
});

const fetchLogs = async () => {
	loading.value = true;
	error.value = "";

	try {
		const res = await api.get("/security/login-logs");
		logs.value = res.data;
	} catch (err) {
		error.value = err.response?.data?.message || t("security.fetchError");
	} finally {
		loading.value = false;
	}
};

const fetchAdminLogs = async () => {
	adminLoading.value = true;

	try {
		const res = await api.get("/security/admin/login-logs", {
			params: {
				page: currentPage.value,
				limit: 20,
				search: search.value || undefined,
			},
		});

		adminLogs.value = res.data.data;
		totalPages.value = res.data.totalPages;
	} catch (err) {
		error.value = err.response?.data?.message || t("security.fetchError");
	} finally {
		adminLoading.value = false;
	}
};

const formatDate = value => {
	return new Date(value).toLocaleString();
};

watch(currentPage, () => {
	if (activeTab.value === "admin") {
		fetchAdminLogs();
	}
});

watch(search, () => {
	currentPage.value = 1;

	if (activeTab.value === "admin") {
		fetchAdminLogs();
	}
});

onMounted(async () => {
	await fetchLogs();

	if (isAdmin.value) {
		await fetchAdminLogs();
	}
});
</script>

<template>
	<DashboardLayout>
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-gray-900">
				{{ t("security.title") }}
			</h1>

			<p class="mt-1 text-sm text-gray-500">
				{{ t("security.subtitle") }}
			</p>
		</div>

		<BaseAlert v-if="error" type="error" :message="error" class="mb-4" />

		<div v-if="isAdmin" class="mb-6 flex gap-2">
			<button
				type="button"
				@click="activeTab = 'my'"
				class="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition"
				:class="
					activeTab === 'my'
						? 'bg-blue-600 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
				">
				{{ t("security.myLogins") }}
			</button>

			<button
				type="button"
				@click="activeTab = 'admin'"
				class="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition"
				:class="
					activeTab === 'admin'
						? 'bg-blue-600 text-white'
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
				">
				{{ t("security.allLogins") }}
			</button>
		</div>

		<BaseCard v-if="activeTab === 'my'">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-900">
					{{ t("security.loginLogs") }}
				</h2>

				<BaseBadge>
					{{ logs.length }}
				</BaseBadge>
			</div>

			<div v-if="loading" class="py-10 text-center text-sm text-gray-500">
				{{ t("security.loading") }}
			</div>

			<div
				v-else-if="logs.length === 0"
				class="py-10 text-center text-sm text-gray-500">
				{{ t("security.noLogs") }}
			</div>

			<div v-else class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-semibold uppercase">
								{{ t("security.date") }}
							</th>

							<th class="px-4 py-3 text-left text-xs font-semibold uppercase">
								IP
							</th>

							<th class="px-4 py-3 text-left text-xs font-semibold uppercase">
								{{ t("security.device") }}
							</th>
						</tr>
					</thead>

					<tbody class="divide-y divide-gray-100 bg-white">
						<tr v-for="log in logs" :key="log.id">
							<td class="px-4 py-3 text-sm text-gray-700">
								{{ formatDate(log.createdAt) }}
							</td>

							<td class="px-4 py-3 text-sm text-gray-700">
								{{ log.ip || "-" }}
							</td>

							<td
								class="max-w-[400px] px-4 py-3 text-sm break-words text-gray-700">
								{{ log.userAgent || "-" }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</BaseCard>

		<BaseCard v-if="activeTab === 'admin'">
			<div
				class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h2 class="text-lg font-semibold text-gray-900">
						{{ t("security.allLogins") }}
					</h2>

					<p class="mt-1 text-sm text-gray-500">
						{{ t("security.adminLogsSubtitle") }}
					</p>
				</div>

				<div class="w-full lg:w-80">
					<BaseInput
						v-model="search"
						type="text"
						:label="t('security.search')"
						:placeholder="t('security.searchPlaceholder')" />
				</div>
			</div>

			<div v-if="adminLoading" class="py-10 text-center text-sm text-gray-500">
				{{ t("security.loading") }}
			</div>

			<div
				v-else-if="adminLogs.length === 0"
				class="py-10 text-center text-sm text-gray-500">
				{{ t("security.noLogs") }}
			</div>

			<div v-else class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-semibold uppercase">
								{{ t("security.user") }}
							</th>

							<th class="px-4 py-3 text-left text-xs font-semibold uppercase">
								Email
							</th>

							<th class="px-4 py-3 text-left text-xs font-semibold uppercase">
								IP
							</th>

							<th class="px-4 py-3 text-left text-xs font-semibold uppercase">
								{{ t("security.date") }}
							</th>
						</tr>
					</thead>

					<tbody class="divide-y divide-gray-100 bg-white">
						<tr v-for="log in adminLogs" :key="log.id">
							<td class="px-4 py-3 text-sm text-gray-700">
								{{
									`${log.user?.firstName ?? ""} ${
										log.user?.lastName ?? ""
									}`.trim() || "-"
								}}
							</td>

							<td class="px-4 py-3 text-sm text-gray-700">
								{{ log.email }}
							</td>

							<td class="px-4 py-3 text-sm text-gray-700">
								{{ log.ip || "-" }}
							</td>

							<td class="px-4 py-3 text-sm text-gray-700">
								{{ formatDate(log.createdAt) }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="mt-6 flex items-center justify-between">
				<BaseButton
					type="button"
					variant="secondary"
					:disabled="currentPage <= 1"
					@click="currentPage--">
					{{ t("pagination.previous") }}
				</BaseButton>

				<div class="text-sm text-gray-600">
					{{ currentPage }} / {{ totalPages }}
				</div>

				<BaseButton
					type="button"
					variant="secondary"
					:disabled="currentPage >= totalPages"
					@click="currentPage++">
					{{ t("pagination.next") }}
				</BaseButton>
			</div>
		</BaseCard>
	</DashboardLayout>
</template>
