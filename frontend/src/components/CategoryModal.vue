<script setup lang="ts">
import { ref, defineExpose } from 'vue';
import axios from 'axios';
import { useUserStore } from '../stores/auth.ts'

const isVisible = ref(false);
const name = ref('');
const errorMessage = ref('');

const userStore = useUserStore();

const emit = defineEmits(['modal-closed']);

const openModal = () => {
    isVisible.value = true;
};

const closeModal = () => {
    isVisible.value = false;
    name.value = '';
    errorMessage.value = '';
    emit('modal-closed');
};

const addCategory = async () => {
    try {
        await axios.post('http://localhost:3000/category', {
            name: name.value,
            userId: userStore.user.id
        });
        closeModal();
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data.error) {
                errorMessage.value = error.response.data.error;
            } else {
                errorMessage.value = 'An error occurred';
            }
        } else {
            errorMessage.value = 'An unknown error occurred';
        }
    }
};


defineExpose({ openModal, closeModal });
</script>

<template>
    <div v-if="isVisible" class="min-w-96 top-full mt-1 right-0 absolute  flex items-start z-50">
        <div class="relative p-4 min-w-96 w-full max-w-md bg-white rounded-lg shadow-lg">
            <div class="flex items-center justify-between p-4 border-b rounded-t">
                <h3 class="text-lg font-semibold text-gray-900">Create New Category</h3>
                <button @click="closeModal" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
            </div>
            <form class="p-4" @submit.prevent="addCategory">
                <div class="grid gap-4 mb-4 grid-cols-2">
                    <div class="col-span-2">
                        <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Name</label>
                        <input v-model="name" type="text" name="name" id="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="Type category name" required>
                    </div>
                </div>
                <div v-if="errorMessage" class="mb-4 text-red-600">
                    {{ errorMessage }}
                </div>
                <button type="submit" class="text-white inline-flex items-center bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                    <svg class="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                    Add new category
                </button>
            </form>
        </div>
    </div>
</template>