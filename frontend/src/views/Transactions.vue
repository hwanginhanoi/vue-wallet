<script setup lang="ts">
import Header from "../components/Header.vue";
import {ref, onMounted, computed} from "vue";
import TransactionDrawer from "../components/TransactionForm.vue";
import axios from 'axios';
import {useUserStore} from "../stores/auth.ts";

interface Transaction {
    id: number;
    date: string;
    category: {
        name: string;
    };
    payee: string;
    amount: number;
}

interface Category {
    id: number;
    name: string;
}

const drawerForm = ref<InstanceType<typeof TransactionDrawer> | null>(null);

const openDrawer = () => {
    if (drawerForm.value) {
        drawerForm.value.openDrawer();
    }
};

const transactions = ref<Transaction[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = ref(10);
const totalCount = ref(0);
const selectedCategory = ref<string | null>(null);
const userStore = useUserStore();
const categories = ref<Category[]>([]);

const editTransaction = ref<Transaction>({
    id: 0,
    date: '',
    category: { name: '' },
    payee: '',
    amount: 0
});

const editingTransactionId = ref<number | null>(null);

const isEditing = (transactionId: number) => {
    return editingTransactionId.value === transactionId;
};

const editRow = (transaction: Transaction) => {
    editingTransactionId.value = transaction.id;
    editTransaction.value = { ...transaction };
};

const saveChanges = async (transactionId: number) => {
    try {
        await axios.put(`http://localhost:3000/transactions/${transactionId}`, editTransaction.value);
        editingTransactionId.value = null;
        await fetchTransactions(currentPage.value);
    } catch (error) {
        console.error('Failed to update transaction:', error);
    }
};

const fetchTransactions = async (page: number) => {
    try {
        const params: any = {
            userId: userStore.user.id,
            page,
            limit: itemsPerPage.value,
        };
        if (selectedCategory.value) {
            params.category = selectedCategory.value;
        }
        const response = await axios.get('http://localhost:3000/transactions', { params });
        transactions.value = response.data.items;
        totalPages.value = response.data.totalPages;
        totalCount.value = response.data.totalCount; // Update totalCount here
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
    }
};

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


const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
        fetchTransactions(page);
    }
};

const handleCategoryChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    selectedCategory.value = target.value;
    fetchTransactions(currentPage.value);
};

const handleDrawerClosed = async () => {
    await fetchTransactions(currentPage.value);
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const selectedTransactions = ref<number[]>([]);

const hasSelectedTransactions = computed(() => selectedTransactions.value.length > 0);

const toggleAllSelection = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
        selectedTransactions.value = transactions.value.map(transaction => transaction.id);
    } else {
        selectedTransactions.value = [];
    }
};

const deleteSelectedTransactions = async () => {
    if (selectedTransactions.value.length === 0) {
        return;
    }

    try {
        await axios.post('http://localhost:3000/transactions/delete', {
            transactionIds: selectedTransactions.value
        });
        selectedTransactions.value = [];
        await fetchTransactions(currentPage.value);
    } catch (error) {
        console.error('Failed to delete transactions:', error);
    }
};


onMounted(() => {
    fetchTransactions(currentPage.value);
    fetchCategories()
});
</script>

<template>
    <Header></Header>
    <section class="p-3 sm:p-5 antialiased">
        <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div class="bg-white relative shadow-md sm:rounded-lg overflow-hidden">
                <div
                    class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div class="w-full md:w-1/2">
                        <select @change="handleCategoryChange" class="border border-gray-300 rounded-lg p-2 w-full">
                            <option value="">All Categories</option>
                            <option v-for="category in categories" :key="category.id" :value="category.name">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>
                    <div
                        class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        <button type="button" id="createProductModalButton" @click="openDrawer"
                                class="flex items-center justify-center text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 focus:outline-none">
                            Add Transaction
                        </button>
                        <div class="flex items-center space-x-3 w-full md:w-auto">
                            <button v-if="hasSelectedTransactions"
                                    type="button"
                                    @click="deleteSelectedTransactions"
                                    class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200"                         >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>


                <table class="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" class="p-4">
                            <div class="flex items-center">
                                <input id="checkbox-all" type="checkbox" @change="toggleAllSelection"
                                       class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-600 focus:ring-2"
                                >
                                <label for="checkbox-all" class="sr-only">checkbox</label>
                            </div>
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Date
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Category
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Payee
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Amount
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Action
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="transaction in transactions" :key="transaction.id" class="bg-white border-b hover:bg-gray-50">
                        <td class="w-4 p-4">
                            <div class="flex items-center">
                                <input type="checkbox" :value="transaction.id" v-model="selectedTransactions "
                                       class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-600 focus:ring-2">
                                <label class="sr-only">checkbox</label>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-900">
                            <input v-if="isEditing(transaction.id)" type="date" v-model="editTransaction.date" class="border border-gray-300 rounded-lg p-2" />
                            <span v-else>{{ formatDate(transaction.date) }}</span>
                        </td>
                        <td class="px-6 py-4 text-gray-900">
                            <select v-if="isEditing(transaction.id)" v-model="editTransaction.category" class="border border-gray-300 rounded-lg p-2">
                                <option v-for="category in categories" :key="category.id" :value="category.name" >
                                    {{ category.name }}
                                </option>
                            </select>
                            <span v-else>{{ transaction.category.name }}</span>
                        </td>
                        <td class="px-6 py-4 text-gray-900">
                            <input v-if="isEditing(transaction.id)" type="text" v-model="editTransaction.payee" class="border border-gray-300 rounded-lg p-2"/>
                            <span v-else>{{ transaction.payee }}</span>
                        </td>
                        <td class="px-6 py-4 text-gray-900">
                            <input v-if="isEditing(transaction.id)" type="number" v-model="editTransaction.amount" class="border border-gray-300 rounded-lg p-2"/>
                            <span v-else>{{ formatAmount(transaction.amount) }}</span>
                        </td>
                        <td class="px-6 py-4 text-gray-900">
                            <button v-if="isEditing(transaction.id)" @click="saveChanges(transaction.id)" class="text-primary-600 hover:underline">Save</button>
                            <button v-else @click="editRow(transaction)" class="text-primary-600 hover:underline">Edit</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <nav
                    class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                    aria-label="Table navigation">
   <span class="text-sm font-normal text-gray-500">
    Showing
    <span class="font-semibold text-gray-900">
        {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalCount) }}
    </span>
    of
    <span class="font-semibold text-gray-900">{{ totalCount }}</span>
</span>
                    <ul class="inline-flex items-stretch -space-x-px">
                        <li>
                            <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1"
                                    class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                                <span class="sr-only">Previous</span>
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </li>
                        <li v-for="page in totalPages" :key="page">
                            <button @click="handlePageChange(page)"
                                    :class="{'bg-green-300 text-grey-600': page === currentPage, 'text-gray-500': page !== currentPage}"
                                    class="flex items-center justify-center text-sm py-2 px-3 leading-tight bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                                {{ page }}
                            </button>
                        </li>
                        <li>
                            <button @click="handlePageChange(currentPage+ 1)" :disabled="currentPage === totalPages"
                                    class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700">
                                <span class="sr-only">Next</span>
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </section>
    <TransactionDrawer ref="drawerForm" @drawerClosed="handleDrawerClosed"/>
</template>

<style scoped>

</style>