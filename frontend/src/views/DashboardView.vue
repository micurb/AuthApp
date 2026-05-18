<script setup>
import { useI18n } from "vue-i18n";

import DashboardLayout from "../layouts/DashboardLayout.vue";

const { t } = useI18n();
</script>

<template>
	<DashboardLayout>
		<div class="mb-6">
			<h1 class="text-2xl font-semibold text-gray-900">
				{{ t("dashboard.title") }}
			</h1>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-6">
			<p class="text-gray-600">
				{{ t("dashboard.welcome") }}
			</p>
		</div>
	</DashboardLayout>
</template>
