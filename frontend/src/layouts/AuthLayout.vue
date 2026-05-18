<template>
	<div class="relative z-1 min-h-screen bg-white p-6 sm:p-0">
		<div
			class="relative flex min-h-screen w-full flex-col justify-center sm:p-0 lg:flex-row">
			<div class="flex w-full flex-1 flex-col lg:w-1/2">
				<div
					class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
					<!-- Mobile branding -->
					<div class="mb-8 flex flex-col items-center lg:hidden">
						<img
							src="/logo.png"
							alt="Logo"
							class="mb-4 h-10 w-auto object-contain" />

						<h1
							class="font-heading text-2xl font-semibold tracking-wide text-gray-800">
							{{ $t("app.name") }}
						</h1>
					</div>

					<slot />
				</div>
			</div>

			<div
				class="relative hidden min-h-screen w-full items-center bg-gray-100 lg:grid lg:w-1/2"">
				<div class="text-center">
					<h1
						class="font-heading mb-6 text-5xl font-semibold tracking-wide text-gray-800">
						{{ $t("app.name") }}
					</h1>

					<div class="mt-8 flex justify-center">
						<img
							src="/logo.png"
							alt="Logo"
							class="h-10 w-auto object-contain" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
