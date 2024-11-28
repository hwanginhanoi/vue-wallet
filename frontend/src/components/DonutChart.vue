<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import { useUserStore } from "../stores/auth.ts";

// Store
const userStore = useUserStore();

// Data and options
const chartSeries = ref<number[]>([]);
const chartLabels = ref<string[]>([]);
const chartOptions = ref<ApexOptions>({
    series: chartSeries.value,
    labels: chartLabels.value,
    colors: ["#1C64F2", "#16BDCA", "#FDBA8C", "#E74694"],
    chart: {
        height: "100%",
        width: "100%",
        type: 'donut',
        fontFamily: "Inter, sans-serif",
        dropShadow: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    stroke: {
        colors: ["transparent"],
    },
    plotOptions: {
        pie: {
            donut: {
                labels: {
                    show: true,
                    name: {
                        show: true,
                        fontFamily: "Inter, sans-serif",
                        offsetY: 20,
                    },
                    total: {
                        showAlways: true,
                        show: true,
                        label: "Total Expenses",
                        fontFamily: "Inter, sans-serif",
                        formatter: (w) => {
                            const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                            return `$${sum.toFixed(2)}`
                        },
                    },
                    value: {
                        show: true,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "bold",
                        fontSize: "30px",
                        offsetY: -20,
                        formatter: (value) => `$${parseInt(value).toFixed(2)}`,
                    },
                },
                size: "70",
            },
        },
    },
    grid: {
        padding: {
            top: -2,
        },
    },
    dataLabels: {
        enabled: false,
    },
    legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
    },
    yaxis: {
        labels: {
            formatter: function (value) {
                return `$${value.toFixed(2)}`
            },
        },
    },
    xaxis: {
        labels: {
            formatter: function (value) {
                return `$${parseInt(value).toFixed(2)}`
            },
        },
        axisTicks: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
    },
});

// Watch for changes in series and labels to update chartOptions
watch([chartSeries, chartLabels], () => {
    chartOptions.value = {
        ...chartOptions.value,
        series: chartSeries.value,
        labels: chartLabels.value
    };
}, { immediate: true });

// Fetch data
const fetchExpensesByCategory = async () => {
    try {
        const response = await axios.get('http://localhost:3000/index/expenses-by-category', {
            params: { userId: userStore.user.id }
        });

        const data = response.data;
        chartSeries.value = data.map((item: { amount: number }) => item.amount);
        chartLabels.value = data.map((item: { category: string }) => item.category);
    } catch (error) {
        console.error('Error fetching expenses by category:', error);
    }
};

onMounted(() => {
    fetchExpensesByCategory();
});
</script>

<template>
    <div class="flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow lg:col-span-1 sm:col-span-3">
        <div class="flex justify-between">
            <div>
                <h5 class="leading-none text-3xl font-bold text-gray-900 dark:text-white pb-2">Categories</h5>
                <p class="text-base font-normal text-gray-500 dark:text-gray-400">Expenses last week</p>
            </div>
        </div>
        <div class="py-6">
            <apexchart type="donut" :options="chartOptions" :series="chartSeries" height="340"></apexchart>
        </div>
    </div>
</template>

<style scoped>
</style>