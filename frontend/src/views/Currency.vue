<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';
import axios from 'axios';
import Header from "../components/Header.vue";

interface CurrencyData {
    [key: string]: number;
}

const currencies = ref<CurrencyData>({});
const effective_date = ref<string>('');
const searchTerm = ref<string>('');

const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);

const sortKey = ref<string>('currency');
const sortAsc = ref<boolean>(true);

const totalPages = computed(() => {
    return Math.ceil(Object.keys(filteredCurrencies.value).length / itemsPerPage.value);
});

const filteredCurrencies = computed(() => {
    const filtered = Object.entries(currencies.value).filter(([currency]) =>
        currency.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
    filtered.sort(([keyA, valueA], [keyB, valueB]) => {
        const compareKeyA = sortKey.value === 'currency' ? keyA : valueA;
        const compareKeyB = sortKey.value === 'currency' ? keyB : valueB;
        if (compareKeyA < compareKeyB) return sortAsc.value ? -1 : 1;
        if (compareKeyA > compareKeyB) return sortAsc.value ? 1 : -1;
        return 0;
    });
    return Object.fromEntries(filtered);
});

const paginatedCurrencies = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    const entries = Object.entries(filteredCurrencies.value).slice(start, end);
    return Object.fromEntries(entries);
});

const displayedPages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    if (total <= 5) {
        return Array.from({length: total}, (_, i) => (i + 1).toString());
    }
    const pages: (number | string)[] = [];
    if (current > 3) pages.push(1, '...');
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push('...', total);
    return pages;
});

function gotoPage(page: number) {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
    }
}

async function fetchCurrency(): Promise<void> {
    const response = await axios.get<{
        eur: CurrencyData;
        date: string
    }>('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json');
    currencies.value = response.data.eur;
    effective_date.value = response.data.date;
}

function changeSort(key: string) {
    if (sortKey.value === key) {
        sortAsc.value = !sortAsc.value;
    } else {
        sortKey.value = key;
        sortAsc.value = true;
    }
}

onMounted(fetchCurrency);
</script>

<template>
    <Header></Header>
    <section class="p-3 sm:p-5 antialiased">
        <div class="mx-auto max-w-screen-xl px-4 lg:px-12">
            <!-- Start coding here -->
            <div class="bg-white relative shadow-md sm:rounded-lg overflow-hidden">
                <div
                    class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div class="w-full md:w-1/2">
                        <form class="flex items-center">
                            <label for="simple-search" class="sr-only">Search</label>
                            <div class="relative w-full">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <svg aria-hidden="true" class="w-5 h-5 text-gray-500" fill="currentColor"
                                         viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd"
                                              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </div>
                                <input type="text" v-model="searchTerm" id="simple-search"
                                       class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2"
                                       placeholder="Search" required></div>
                        </form>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left text-gray-500">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" class="px-4 py-4 cursor-pointer" @click="changeSort('currency')">
                                Source Currency
                                <span v-if="sortKey === 'currency'"
                                      :class="{'text-green-500 ml-1': sortAsc, 'text-red-500 ml-1': !sortAsc}">
                                    {{ sortAsc ? '▲' : '▼' }}
                                </span>
                                <span v-else class="ml-1">
                                    ▲▼
                                </span>
                            </th>
                            <th scope="col" class="px-4 py-3"></th>
                            <th scope="col" class="px-4 py-3">Target Currency</th>
                            <th scope="col" class="px-4 py-3 cursor-pointer" @click="changeSort('rate')">
                                Exchange Rate
                                <span v-if="sortKey === 'rate'"
                                      :class="{'text-green-500 ml-1': sortAsc, 'text-red-500 ml-1': !sortAsc}">
                                    {{ sortAsc ? '▲' : '▼' }}
                                </span>
                                <span v-else class="ml-1">
                                ▲▼
                            </span>
                            </th>
                            <th scope="col" class="px-4 py-3">Effective Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="border-b" v-for="(rate, currency) in paginatedCurrencies" :key="currency">
                            <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                                {{ String(currency).toUpperCase() }}
                            </th>
                            <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd"
                                     clip-rule="evenodd">
                                    <path
                                        d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/>
                                </svg>
                            </th>
                            <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">EUR</th>
                            <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{{
                                    rate
                                }}
                            </th>
                            <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                                {{ effective_date }}
                            </th>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <nav
                    class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                    aria-label="Table navigation">
                <span class="text-sm font-normal text-gray-500">
                    Showing
                    <span class="font-semibold text-gray-900">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                     to
                    <span class="font-semibold text-gray-900">{{
                            Math.min(currentPage * itemsPerPage, Object.keys(filteredCurrencies).length)
                        }}</span>
                    of
            <span class="font-semibold text-gray-900">{{ Object.keys(filteredCurrencies).length }}</span>
                </span>
                    <ul class="inline-flex items-stretch -space-x-px">
                        <!-- Previous button -->
                        <li>
                            <a href="#" @click.prevent="gotoPage(currentPage - 1)"
                               :class="['flex', 'items-center', 'justify-center', 'h-full', 'py-1.5', 'px-3', 'ml-0', 'text-gray-500', 'bg-white', 'rounded-l-lg', 'border', 'border-gray-300', currentPage === 1 ? 'pointer-events-none' : '', 'hover:bg-gray-100', 'hover:text-gray-700']">
                                <span class="sr-only">Previous</span>
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </a>
                        </li>

                        <!-- Displayed pages -->
                        <template v-for="pageNumber in displayedPages" :key="pageNumber">
                            <li v-if="pageNumber === '...'" :key="pageNumber">
                                <a class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700">{{
                                        pageNumber
                                    }}</a>
                            </li>
                            <li v-else>
                                <a @click.prevent="gotoPage(Number(pageNumber))"
                                   :class="['flex', 'items-center', 'justify-center', 'text-sm', 'py-2', 'px-3', 'leading-tight', 'text-gray-500', 'bg-white', 'border', 'border-gray-300', currentPage === pageNumber ? 'text-primary-600 bg-primary-50 border-primary-300 hover:bg-primary-100 hover:text-primary-700' : 'hover:bg-gray-100 hover:text-gray-700']">{{
                                        pageNumber
                                    }}</a>
                            </li>
                        </template>
                        <li>
                            <a @click.prevent="gotoPage(currentPage + 1)"
                               :class="['flex', 'items-center', 'justify-center', 'h-full', 'py-1.5', 'px-3', 'leading-tight', 'text-gray-500', 'bg-white', 'rounded-r-lg', 'border', 'border-gray-300', currentPage === totalPages ? 'pointer-events-none' : '', 'hover:bg-gray-100', 'hover:text-gray-700']">
                                <span class="sr-only">Next</span>
                                <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd"
                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </section>
</template>

<style scoped>
</style>