<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useUserStore } from "../stores/auth.ts";
import { useIntervalFn } from '@vueuse/core';

const userStore = useUserStore();

const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

const today = new Date();
const last7DaysEnd = new Date(today);
last7DaysEnd.setDate(today.getDate() - 1);
const last7DaysStart = new Date(today);
last7DaysStart.setDate(today.getDate() - 7);

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (date: Date): string => {
    return `${monthNames[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

const dateRange = ref(`${formatDate(last7DaysStart)} - ${formatDate(last7DaysEnd)}`);

// Define reactive variables
const todayRemaining = ref(0);
const percentageChange = ref(0);
const displayValue = ref(0);
const targetValue = ref(0);
const isNegative = ref(false);
const increment = ref(0);

const fetchData = async () => {
    try {
        const response = await axios.get('http://localhost:3000/index/expenses', {
            params: { userId: userStore.user.id }
        });
        const { last7DaysExpenses : last7DaysExpenses, percentageChange: changePercentage } = response.data;
        todayRemaining.value = last7DaysExpenses;
        percentageChange.value = changePercentage;

        targetValue.value = todayRemaining.value;
        isNegative.value = targetValue.value < 0;
        increment.value = Math.ceil(Math.abs(targetValue.value) / 200);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const startAnimation = () => {
    useIntervalFn(() => {
        if (isNegative.value) {
            if (displayValue.value > targetValue.value) {
                displayValue.value -= increment.value;
                if (displayValue.value < targetValue.value) {
                    displayValue.value = targetValue.value;
                }
            }
        } else {
            if (displayValue.value < targetValue.value) {
                displayValue.value += increment.value;
                if (displayValue.value > targetValue.value) {
                    displayValue.value = targetValue.value;
                }
            }
        }
    }, 10); // Adjust interval for smooth animation
};

// Watch for changes in targetValue to start animation
watch(targetValue, () => {
    startAnimation();
});

// Compute the color class based on percentageChange
const percentageColorClass = computed(() => {
    return percentageChange.value >= 0 ? 'text-green-500' : 'text-red-500';
});

// Call fetchData on component mount
onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="flex flex-col p-6 bg-white border border-gray-200 rounded-lg shadow">
        <a href="#">
            <h5 class="mb-2 text-2xl font-semibold tracking-tight text-gray-900">Expenses</h5>
        </a>
        <p class="mb-6 font-normal text-gray-500">{{ dateRange }}</p>
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">
            {{ formatAmount(displayValue) }}
        </h5>
        <p class="mb-3 font-normal" :class="percentageColorClass">
            {{ percentageChange.toFixed(2) }}% compared to last period
        </p>
    </div>
</template>

<style scoped>
</style>