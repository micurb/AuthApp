<script setup>
import { computed } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const logout = () => {
	auth.logout();
	router.push("/login");
};

const roleLabel = computed(() => {
	if (auth.user?.isSuperAdmin) {
		return "Super Administrator";
	}

	if (auth.user?.role === "ADMIN") {
		return "Administrator";
	}

	return "Użytkownik";
});

const currentPage = computed(() => {
	const map = {
		"/dashboard": "Dashboard",
		"/users": "Użytkownicy",
		"/email-templates": "Szablony email",
		"/profile": "Profil",
	};

	return map[route.path] || "Panel";
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
		<!-- Lewa strona -->
		<div class="flex items-center gap-3 text-sm">
			<span
				v-if="auth.user?.isSuperAdmin"
				class="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
				{{ roleLabel }}
			</span>

			<span
				v-else-if="auth.user?.role === 'ADMIN'"
				class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
				{{ roleLabel }}
			</span>

			<span
				v-else
				class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
				{{ roleLabel }}
			</span>

			<div class="flex items-center gap-2 text-gray-500">
				<RouterLink
					to="/dashboard"
					class="font-medium text-gray-700 hover:text-blue-600">
					Dashboard
				</RouterLink>

				<span>/</span>

				<span class="text-gray-900">
					{{ currentPage }}
				</span>
			</div>
		</div>

		<!-- Prawa strona -->
		<div class="flex items-center gap-4">
			<span class="text-sm text-gray-600">
				Witaj,
				<span class="font-medium text-gray-900">
					{{ fullName || auth.user?.email }}
				</span>
				<span class="text-gray-500"> ({{ auth.user?.email }}) </span>
			</span>

			<button
				@click="logout"
				class="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-100">
				Wyloguj
			</button>
		</div>
	</header>
</template>
