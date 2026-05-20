<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Menu } from "lucide-vue-next";

import BaseBadge from "../ui/BaseBadge.vue";
import BaseButton from "../ui/BaseButton.vue";
import { useAuthStore } from "../../stores/auth";

defineEmits(["open-sidebar"]);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const { t } = useI18n();

const pageTitle = computed(() => {
	if (route.path.startsWith("/users")) {
		return t("sidebar.users");
	}

	if (route.path.startsWith("/profile")) {
		return t("sidebar.profile");
	}

	if (route.path.startsWith("/email-templates")) {
		return t("sidebar.emailTemplates");
	}

	return t("sidebar.dashboard");
});

const roleVariant = computed(() => {
	if (auth.user?.isSuperAdmin) {
		return "purple";
	}

	if (auth.user?.role === "ADMIN") {
		return "info";
	}

	return "gray";
});

const roleLabel = computed(() => {
	if (auth.user?.isSuperAdmin) {
		return "SUPER ADMIN";
	}

	return auth.user?.role || "USER";
});

const logout = async () => {
	auth.logout();
	await router.push("/login");
};
</script>

<template>
	<header
		class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
		<div class="flex items-center gap-3">
			<button
				type="button"
				@click="$emit('open-sidebar')"
				class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-gray-700 transition hover:bg-gray-100 lg:hidden">
				<Menu class="h-5 w-5" />
			</button>

			<div>
				<p class="text-xs font-medium uppercase tracking-wide text-gray-400">
					{{ t("app.name") }}
				</p>

				<h1 class="text-lg font-semibold text-gray-900">
					{{ pageTitle }}
				</h1>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<div class="hidden items-center gap-3 sm:flex">
				<p class="text-sm font-medium text-gray-900">
					{{ t("topbar.welcome") }}
					{{ auth.user?.firstName }} {{ auth.user?.lastName }}
				</p>

				<BaseBadge :variant="roleVariant">
					{{ roleLabel }}
				</BaseBadge>
			</div>

			<BaseButton variant="secondary" size="sm" @click="logout">
				{{ t("topbar.logout") }}
			</BaseButton>
		</div>
	</header>
</template>
