<script setup>
import { ref } from "vue";
import AuthLayout from "../layouts/AuthLayout.vue";
import { api } from "../api";

const email = ref("");
const success = ref(null);
const error = ref(null);
const loading = ref(false);

const submit = async () => {
  success.value = null;
  error.value = null;

  try {
    loading.value = true;

    const res = await api.post("/auth/forgot-password", {
      email: email.value,
    });

    success.value = res.data.message;
  } catch (err) {
    error.value = "Nie udało się wysłać emaila resetującego";
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
          Przypomnij hasło
        </h1>

        <p class="text-sm text-gray-500">
          Podaj email, a wyślemy link do resetu hasła.
        </p>
      </div>

      <form @submit.prevent="submit">
        <div class="space-y-5">
          <div>
            <label
              class="font-heading mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              v-model="email"
              type="email"
              placeholder="twoj@email.com"
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
            {{ loading ? "Wysyłanie..." : "Wyślij link resetujący" }}
          </button>
        </div>
      </form>
    </div>
  </AuthLayout>
</template>