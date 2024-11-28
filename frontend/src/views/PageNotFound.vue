<script setup lang="ts">

</script>

<template>
    <div class="flex flex-row min-h-screen justify-center items-center">
        <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div class="mx-auto max-w-screen-sm text-center">
                <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 vue-accent">404</h1>
                <p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl">Something's missing.</p>
                <p class="mb-4 text-lg font-light text-gray-500">Sorry, we can't find that page. You'll find lots to
                    explore on the home page. </p>
                <a href="/"
                   class="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Back
                    to Homepage</a>
            </div>
        </div>
    </div>
</template>

<style scoped>
.vue-accent {
    background: linear-gradient(315deg, #42d392 25%, #647eff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
</style>