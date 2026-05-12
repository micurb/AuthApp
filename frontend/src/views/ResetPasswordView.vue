<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthLayout from "../layouts/AuthLayout.vue";
import { api } from "../api";

const route = useRoute();
const router = useRouter();

const token = route.query.token;

const password = ref("");
const confirmPassword = ref("");
const error = ref(null);
const success = ref(null);
const loading = ref(false);

const submit = async () => {
  error.value = null;
  success.value = null;

  if (!token) {
    error.value = "Brak tokena resetującego";
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = "Hasła nie są takie same";
    return;
  }

  try {
    loading.value = true;

    const res = await api.post("/auth/reset-password", {
      token,
      password: password.value,
    });

    success.value = res.data.message;

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  } catch (err) {
    error.value = err.response?.data?.message || "Nie udało się zmienić hasła";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <AuthLayout>
    <div>
      <div class="mb-5 sm:mb-8">
        <h1 class="font-heading mb-2 text-xl font-semibold text-gray-800">
          Reset hasła
        </h1>

        <p class="text-sm text-gray-500">
          Ustaw nowe hasło do swojego konta.
        </p>
      </div>

      <form @submit.prevent="submit">
        <div class="space-y-5">
          <div>
            <label class="font-heading mb-1.5 block text-sm font-medium text-gray-700">
              Nowe hasło
            </label>

            <input
              v-model="password"
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

          <p v-if="success" class="text-sm text-green-600">
            {{ success }}
          </p>

          <p v-if="error" class="text-sm text-red-600">
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="loading"
            class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? "Zapisywanie..." : "Zmień hasło" }}
          </button>
        </div>
      </form>
    </div>
  </AuthLayout>
</template>