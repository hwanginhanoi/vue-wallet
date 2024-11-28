<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import { useUserStore } from '../stores/auth.ts';

const chartOptions = ref<ApexOptions>({
    chart: {
        height: "100%",
        width: "100%",
        type: "line",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    tooltip: {
        enabled: true,
        x: {
            show: false,
        },
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 6,
        curve: 'smooth'
    },
    grid: {
        show: true,
        strokeDashArray: 4,
        padding: {
            left: 2,
            right: 2,
            top: -26
        },
    },
    series: [],
    legend: {
        show: true,
    },
    xaxis: {
        type: 'category',
        categories: [], // Updated by watch
        labels: {
            show: true,
            style: {
                fontFamily: "Inter, sans-serif",
                cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
            }
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        show: true,
    },
});

const series = ref<any[]>([]);
const labels = ref<string[]>([]);
const userStore = useUserStore();

const fetchData = async () => {
    try {
        const userId = userStore.user.id;
        const response = await axios.get('http://localhost:3000/index/financial-series', { params: { userId } });
        const { incomeSeries, expensesSeries, labels: responseLabels } = response.data;

        chartOptions.value.xaxis.categories = responseLabels

        series.value = [
            {
                name: "Income",
                data: incomeSeries,
                color: "#42b883",
            },
            {
                name: "Expenses",
                data: expensesSeries,
                color: "#DC143C",
            },
        ];
        labels.value = responseLabels;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

watch([series, labels], ([, newLabels]) => {
    chartOptions.value.xaxis = {
        ...(chartOptions.value.xaxis || {}),
        categories: newLabels
    };
}, { immediate: true });

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow lg:col-span-2 sm:col-span-3">
        <div class="flex justify-between">
            <div>
                <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Transactions</h5>
            </div>
            <div class="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500 dark:text-green-500 text-center">
                12%
                <svg class="w-3 h-3 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4"/>
                </svg>
            </div>
        </div>
        <apexchart type="line" :options="chartOptions" :series="series" height="300"></apexchart>
        <div class="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between">
            <div class="flex justify-between items-center pt-5">
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 text-center inline-flex items-center dark:hover:text-white" type="button">
                    Last 7 days
                </div>
            </div>
        </div>
    </div>
</template>