<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/auth';

const username = ref('');
const password = ref('');
const error = ref('');

const userStore = useUserStore();
const router = useRouter();

const handleLogin = async () => {
    await userStore.login(username.value, password.value);
    if (!userStore.error) {
        await router.push('/dashboard');
    } else {
        error.value = userStore.error;
    }
};
</script>

<template>
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
            <img class="w-8 h-8 mr-2" src="../assets/logo.png" alt="logo" />
        </a>
        <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                    Log in to your account
                </h1>
                <form class="space-y-4 md:space-y-6" @submit.prevent="handleLogin">
                    <div>
                        <label for="username" class="block mb-2 text-sm font-medium text-gray-900">Username</label>
                        <input
                            type="text"
                            v-model="username"
                            id="username"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            placeholder="Your Username"
                            required
                        />
                    </div>
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                        <input
                            type="password"
                            v-model="password"
                            id="password"
                            placeholder="••••••••"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                            required
                        />
                        <div v-if="error" class="text-red-500 text-sm mt-1">
                            {{ error }}
                        </div>
                    </div>
                    <button
                        type="submit"
                        class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                        Log in
                    </button>
                    <p class="text-sm font-light text-gray-500">
                        Don’t have an account yet? <RouterLink to="/register" class="font-medium text-primary-600 hover:underline">Sign up</RouterLink>
                    </p>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
