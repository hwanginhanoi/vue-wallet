<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import DatePicker from "./DatePicker.vue";
import { useUserStore } from "../stores/auth.ts";

interface Category {
    id: number;
    name: string;
}

const userStore = useUserStore();

const visible = ref(false);

const openDrawer = () => {
    visible.value = true;
};

const closeDrawer = () => {
    visible.value = false;
    isIncome.value = null;
    emit('drawerClosed');
    resetForm()
};

const emit = defineEmits(['drawerClosed']);

defineExpose({
    openDrawer,
    closeDrawer
});

const isIncome = ref<boolean | null>(null);

const toggleType = () => {
    if (isIncome.value === null) {
        isIncome.value = true;
    } else {
        isIncome.value = !isIncome.value;
    }
};

const buttonText = computed(() => {
    if (isIncome.value === null) return 'o';
    return isIncome.value ? '+' : '-';
});

const buttonClass = computed(() => {
    if (isIncome.value === null) return 'bg-gray-300 text-gray-300';
    return isIncome.value ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
});

const categories = ref<Category[]>([]);

const fetchCategories = async () => {
    try {
        const response = await axios.get('http://localhost:3000/category', {
            params: { userId: userStore.user.id }
        });
        categories.value = response.data.categories;
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }
};

onMounted(() => {
    fetchCategories();
});

const date = ref<string | null>(null);
const amount = ref<number | null>(null);
const payee = ref<string>('');
const categoryId = ref<number | null>(null);

const resetForm = () => {
    date.value = null;
    amount.value = null;
    payee.value = '';
    categoryId.value = null;
    isIncome.value = null;
};

const createTransaction = async () => {
    try {
        const dateHTML = document.getElementById('datepicker-custom') as HTMLInputElement;
        if (dateHTML) {
            date.value = dateHTML.value;
            console.log('Date Value:', dateHTML.value);
        }

        if (!date.value || !amount.value || !payee.value || !categoryId.value || isIncome.value === null) {
            alert('Please fill in all required fields.');
            return;
        }

        const transactionAmount = isIncome.value ? amount.value : -amount.value;

        await axios.post('http://localhost:3000/transactions', {
            date: date.value,
            amount: transactionAmount,
            payee: payee.value,
            categoryId: categoryId.value,
            userId: userStore.user.id,
        });

        alert('Transaction created successfully.');
        closeDrawer();
    } catch (error) {
        console.error('Failed to create transaction:', error);
        alert('Failed to create transaction.');
    }
};
</script>

<template>
    <div
        v-if="visible"
        class="fixed inset-0 bg-black bg-opacity-50 z-30"
        @click="closeDrawer"
    ></div>
    <div
        id="drawer-form"
        :class="{ 'translate-x-0': visible }"
        class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white w-full sm:w-80 md:w-96 lg:w-[400px] xl:w-[500px]"
        aria-labelledby="drawer-form-label"
    >
        <h5 id="drawer-label"
            class="inline-flex items-center mb-1 text-base font-semibold text-gray-900 uppercase">
            New Transaction
        </h5>
        <button
            type="button"
            aria-controls="drawer-form"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center"
            @click="closeDrawer"
        >
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close menu</span>
        </button>
        <h6 class="mb-4 text-gray-500 text-xs">
            Add a new transaction
        </h6>
        <form @submit.prevent="createTransaction" class="mb-6">
            <div class="relative mb-6">
                <DatePicker></DatePicker>
            </div>
            <div class="mb-6">
                <label for="category" class="block mb-2 text-sm font-medium text-gray-900">Category</label>
                <div class="relative">
                    <select id="category" v-model="categoryId" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500" :disabled="!categories.length">
                        <option v-if="!categories.length" selected disabled>Create a category first</option>
                        <option v-else v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                    </select>
                </div>
            </div>
            <div class="mb-2">
                <label for="amount" class="block mb-2 text-sm font-medium text-gray-900">Amount</label>
                <div class="relative">
                    <input type="number" id="amount" v-model="amount"
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pl-10"
                           placeholder="Type amount"
                           required />
                    <button @click="toggleType" type="button" :class="buttonClass" class="absolute left-2 top-0 mt-2 px-2 rounded-md w-6 flex items-center justify-center">
                        {{ buttonText }}
                    </button>
                </div>
            </div>
            <div class="mb-6">
                <label for="payee" class="block mb-2 text-sm font-medium text-gray-900">Payee</label>
                <div class="relative">
                    <input type="text" id="payee" v-model="payee"
                           class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                           placeholder="Type payee"
                           required />
                </div>
            </div>
            <button type="submit"
                    class="text-white justify-center flex items-center bg-primary-600 hover:bg-primary-800 w-full focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2">
                Create transaction
            </button>
        </form>
    </div>
</template>

<style scoped>
#drawer-form {
    transform: translateX(-100%);
}

#drawer-form.translate-x-0 {
    transform: translateX(0);
}
</style>