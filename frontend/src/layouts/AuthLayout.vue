<template>
  <div class="relative z-1 bg-white p-6 sm:p-0">
    <div class="relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row">
      
      <!-- Lewa strona: zawartość formularza -->
      <div class="flex w-full flex-1 flex-col lg:w-1/2">
        <div class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <slot />
        </div>
      </div>

      <!-- Prawa strona: branding -->
      <div class="relative hidden h-full w-full items-center bg-gray-100 lg:grid lg:w-1/2">
        <div class="text-center">
          <h1 class="font-heading mb-6 text-5xl font-semibold tracking-wide text-gray-800">
            {{ $t("app.name") }}
          </h1>

          <div class="mt-8 flex justify-center">
            <img
              src="/logo.png"
              alt="Logo"
              class="h-10 w-auto object-contain"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>