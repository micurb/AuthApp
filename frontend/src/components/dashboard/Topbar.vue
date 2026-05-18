<script setup>
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth";

const ROLE = {
	ADMIN: "ADMIN",
};

const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const logout = () => {
	auth.logout();
	router.push("/login");
};

const roleLabel = computed(() => {
	if (auth.user?.isSuperAdmin) {
		return t("topbar.superAdmin");
	}

	if (auth.user?.role === ROLE.ADMIN) {
		return t("topbar.admin");
	}

	return t("topbar.user");
});

const currentPage = computed(() => {
	const map = {
		"/dashboard": t("topbar.dashboard"),
		"/users": t("topbar.users"),
		"/email-templates": t("topbar.emailTemplates"),
		"/profile": t("topbar.profile"),
	};

	return map[route.path] ?? t("topbar.dashboard");
});

const fullName = computed(() => {
	const firstName = auth.user?.firstName || "";
	const lastName = auth.user?.lastName || "";

	return `${firstName} ${lastName}`.trim();
});
</script>

<template>
	<header
		class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
		<div class="flex items-center gap-3 text-sm">
			<span
				v-if="auth.user?.isSuperAdmin"
				class="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
				{{ roleLabel }}
			</span>

			<span
				v-else-if="auth.user?.role === ROLE.ADMIN"
				class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
				{{ roleLabel }}
			</span>

			<span
				v-else
				class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
				{{ roleLabel }}
			</span>

			<div class="flex items-center gap-2 text-gray-500">
				<span
					v-if="route.path === '/dashboard'"
					class="font-medium text-gray-900">
					{{ t("topbar.dashboard") }}
				</span>

				<template v-else>
					<RouterLink
						to="/dashboard"
						class="font-medium text-gray-700 hover:text-blue-600">
						{{ t("topbar.dashboard") }}
					</RouterLink>

					<span>/</span>

					<span class="text-gray-900">
						{{ currentPage }}
					</span>
				</template>
			</div>
		</div>

		<div class="flex items-center gap-4">
			<span class="text-sm text-gray-600">
				{{ t("topbar.welcome") }},
				<span class="font-medium text-gray-900">
					{{ fullName || auth.user?.email }}
				</span>
				<span class="text-gray-500"> ({{ auth.user?.email }}) </span>
			</span>

			<button
				@click="logout"
				class="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-100">
				{{ t("topbar.logout") }}
			</button>
		</div>
	</header>
</template>