<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../../stores/auth";
import LanguageSwitcher from "../common/LanguageSwitcher.vue";

const ROLE = {
	ADMIN: "ADMIN",
};

const auth = useAuthStore();
const { t } = useI18n();

const menuItems = computed(() => {
	const items = [
		{
			label: t("sidebar.dashboard"),
			path: "/dashboard",
		},
	];

	if (auth.user?.role === ROLE.ADMIN) {
		items.push({
			label: t("sidebar.users"),
			path: "/users",
		});
	}

	if (auth.user?.isSuperAdmin) {
		items.push({
			label: t("sidebar.emailTemplates"),
			path: "/email-templates",
		});
	}

	items.push({
		label: t("sidebar.profile"),
		path: "/profile",
	});

	return items;
});
</script>

<template>
	<aside
		class="fixed left-0 top-0 hidden h-screen w-72 flex-col border-r border-gray-200 bg-white lg:flex">
		<div class="flex h-16 items-center border-b border-gray-200 px-6">
			<span class="text-lg font-semibold text-gray-900">
				{{ t("app.name") }}
			</span>
		</div>

		<div class="flex flex-1 flex-col justify-between">
			<nav class="p-4">
				<RouterLink
					v-for="item in menuItems"
					:key="item.path"
					:to="item.path"
					class="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
					active-class="bg-blue-50 text-blue-700">
					{{ item.label }}
				</RouterLink>
			</nav>

			<div class="border-t border-gray-200 p-4">
				<p class="mb-2 text-xs font-medium text-gray-500">
					{{ t("sidebar.language") }}
				</p>

				<LanguageSwitcher />
			</div>
		</div>
	</aside>
</template>