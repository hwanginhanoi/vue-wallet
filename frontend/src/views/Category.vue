<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import Header from '../components/Header.vue';
import CategoryModal from "../components/CategoryModal.vue";
import { useUserStore } from '../stores/auth.ts';

const userStore = useUserStore();
const categoryModal = ref<InstanceType<typeof CategoryModal> | null>(null);

// Pagination state
const currentPage = ref(1);
const pageSize = ref(10);
const totalCategories = ref(0);
const categories = ref<{ id: number; name: string }[]>([]);
const selectedCategories = ref<number[]>([]);
const searchQuery = ref('');

const isLoading = ref(false); // Loading state

const toggleAll = (event: Event) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    selectedCategories.value = isChecked ? categories.value.map(c => c.id) : [];
};

watch(() => selectedCategories.value.length, () => {
    const checkboxAll = document.getElementById('checkbox-all-search') as HTMLInputElement;
    if (checkboxAll) {
        checkboxAll.checked = selectedCategories.value.length === categories.value.length;
    }
});

// Function to delete selected categories
const deleteSelected = async () => {
    try {
        if (selectedCategories.value.length === 0) {
            alert('No categories selected.');
            return;
        }

        await axios.delete('http://localhost:3000/category', {
            data: {
                userId: userStore.user.id,
                categoryIds: selectedCategories.value
            }
        });

        await fetchCategories();
        selectedCategories.value = []; // Clear selected categories
    } catch (error) {
        console.error('Error deleting categories:', error);
    }
};

// Function to fetch categories based on search query
const fetchCategories = async () => {
    isLoading.value = true;
    try {
        const response = await axios.get('http://localhost:3000/category', {
            params: {
                userId: userStore.user.id,
                page: currentPage.value,
                limit: pageSize.value,
                search: searchQuery.value // Include search parameter
            }
        });
        categories.value = response.data.categories;
        totalCategories.value = response.data.pagination.total;
    } catch (error) {
        console.error('Error fetching categories:', error);
    } finally {
        isLoading.value = false;
    }
};

// Function to handle page changes
const goToPage = (page: number) => {
    const totalPages = Math.ceil(totalCategories.value / pageSize.value);
    if (page > 0 && page <= totalPages) {
        currentPage.value = page;
        fetchCategories();
    }
};

// Fetch categories on initial mount
onMounted(() => {
    fetchCategories();
});

// Function to open category modal
const openCategoryModal = () => {
    if (categoryModal.value) {
        categoryModal.value.openModal();
    }
};

// Function to handle modal close event
const onModalClosed = () => {
    fetchCategories();
};
</script>

<template>
    <Header></Header>
    <section class="p-3 sm:p-5 antialiased">
        <div class="mx-auto max-w-screen-lg px-4 lg:px-12">
            <div class="bg-white relative shadow-md sm:rounded-lg">
                <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div class="w-full md:w-1/2">
                        <form class="flex items-center">
                            <label for="search" class="sr-only">Search</label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <input type="text" id="search" v-model="searchQuery" @input="fetchCategories" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2" placeholder="Search categories...">
                            </div>
                        </form>
                    </div>
                    <div class="relative w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        <button @click="openCategoryModal" type="button" class="relative flex items-center justify-center text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none">
                            Add Category
                        </button>
                        <CategoryModal ref="categoryModal" @modal-closed="onModalClosed"/>
                        <button
                            v-if="selectedCategories.length > 0"
                            @click="deleteSelected"
                            type="button"
                            class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200"                         >
                            Delete
                        </button>
                    </div>
                </div>
                <table class="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" class="p-4">
                            <div class="flex items-center">
                                <input
                                    id="checkbox-all-search"
                                    type="checkbox"
                                    class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-600 focus:ring-2"
                                    @change="toggleAll"
                                >
                                <label for="checkbox-all-search" class="sr-only">Select all</label>
                            </div>
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Category
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="category in categories" :key="category.id" class="bg-white border-b hover:bg-gray-50">
                        <td class="w-4 p-4">
                            <div class="flex items-center">
                                <input
                                    type="checkbox"
                                    :id="'checkbox-table-search-' + category.id"
                                    v-model="selectedCategories"
                                    :value="category.id"
                                    class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-600 focus:ring-2"
                                />
                                <label :for="'checkbox-table-search-' + category.id" class="sr-only">checkbox</label>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-900">
                            {{ category.name }}
                        </td>
                    </tr>
                    </tbody>
                </table>
                <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Pagination Navigation">
    <span class="text-sm font-normal text-gray-500">
        Showing
        <span class="font-semibold text-gray-900">{{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalCategories) }}</span>
        of
        <span class="font-semibold text-gray-900">{{ totalCategories }}</span>
    </span>
                    <ul class="inline-flex items-stretch -space-x-px">
                        <li>
                            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" aria-label="Previous Page" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </li>
                        <li v-for="pageNumber in Math.ceil(totalCategories / pageSize)" :key="pageNumber">
                            <button @click="goToPage(pageNumber)" :class="{'bg-green-300 text-grey-600': pageNumber === currentPage, 'text-gray-500': pageNumber !== currentPage}" class="flex items-center justify-center text-sm py-2 px-3 leading-tight bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                                {{ pageNumber }}
                            </button>
                        </li>
                        <li>
                            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === Math.ceil(totalCategories / pageSize)" aria-label="Next Page" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </li>
                    </ul>
                    <div v-if="isLoading" class="text-gray-500">Loading...</div> <!-- Loading indicator -->
                </nav>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>