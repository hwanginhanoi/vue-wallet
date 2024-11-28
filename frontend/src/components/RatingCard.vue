<template>
    <div class="bg-white p-20 rounded-lg shadow-lg mb-4">
        <h3 class="text-xl font-semibold mb-2">Rated at {{ formatDate(feedback.createdAt) }}</h3>
        <div class="flex items-center mb-2">
            <template v-for="i in 5" :key="i">
                <span :class="{ 'text-yellow-300': i <= feedback.rating }">★</span>
            </template>
        </div>
        <p class="text-gray-600">{{ feedback.comment }}</p>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    feedback: {
        id: number; userId: number, rating: number; comment: string, createdAt : Date
    };
}>();

const formatDate = (dateString: Date): string => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>