<template>
	<div class="min-h-screen bg-white">
		<div class="flex min-h-screen flex-col lg:flex-row">
			<!-- LEFT -->
			<div class="flex w-full flex-1 items-center justify-center p-6 lg:w-1/2">
				<div class="w-full max-w-md">
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

			<!-- RIGHT -->
			<div
				class="hidden w-full items-center justify-center bg-gray-100 lg:flex lg:w-1/2">
				<div class="text-center">
					<h1
						class="font-heading mb-6 text-5xl font-semibold tracking-wide text-gray-800">
						{{ $t("app.name") }}
					</h1>

					<div class="flex justify-center">
						<img
							src="/logo.png"
							alt="Logo"
							class="h-12 w-auto object-contain" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
