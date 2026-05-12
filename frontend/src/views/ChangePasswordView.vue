<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api";
import AuthLayout from "../layouts/AuthLayout.vue";

const router = useRouter();

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const error = ref(null);

const submit = async () => {
  error.value = null;

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Hasła nie są takie same";
    return;
  }

  try {
    await api.patch("/profile/password", {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });

    router.push("/dashboard");
  } catch (err) {
    error.value = err.response?.data?.message || "Błąd zmiany hasła";
  }
};
</script>

<template>
  <AuthLayout>
    <div>
      <div class="mb-5 sm:mb-8">
        <h1 class="font-heading mb-2 text-xl font-semibold text-gray-800">
          Zmień hasło
        </h1>

        <p class="text-sm text-gray-500">
          Musisz zmienić hasło przed dalszym korzystaniem z systemu.
        </p>
      </div>

      <form @submit.prevent="submit">
        <div class="space-y-5">
          <div>
            <label class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
              Aktualne hasło
            </label>
            <input
              v-model="currentPassword"
              type="password"
              class="shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
              Nowe hasło
            </label>
            <input
              v-model="newPassword"
              type="password"
              class="shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
              Powtórz nowe hasło
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              class="shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden"
            />
          </div>

          <p v-if="error" class="text-sm text-red-600">
            {{ error }}
          </p>

          <button
            type="submit"
            class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Zmień hasło
          </button>
        </div>
      </form>
    </div>
  </AuthLayout>
</template>