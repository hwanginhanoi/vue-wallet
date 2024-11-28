<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from "../stores/auth.ts";
import Header from "../components/Header.vue";

const comment = ref('');
const rating = ref<number | null>(null);
const userStore = useUserStore();

const rate = (value: number) => {
    rating.value = value;
};

const submitRating = async () => {
    if (rating.value === null) {
        alert('Please select a rating');
        return;
    }

    const ratingData = {
        userId: userStore.user.id,
        rating: rating.value,
        comment: comment.value,
    };

    try {
        await axios.post('http://localhost:3000/ratings/submit', ratingData);
        alert('Rating submitted successfully');
        await fetchUserRating(); // Refresh rating after submission
    } catch (error) {
        console.error('Failed to submit rating:', error);
        alert('Failed to submit rating');
    }
};

const fetchUserRating = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/ratings/user/${userStore.user.id}`);
        const data = response.data;
        rating.value = data.rating;
        comment.value = data.comment;
    } catch (error) {
        if (error.response.status === 404) {
            // No rating found, allow new rating
            rating.value = null;
            comment.value = '';
        } else {
            console.error('Failed to fetch user rating:', error);
        }
    }
};

onMounted(() => {
    fetchUserRating();
});
</script>

<template>
    <Header></Header>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h1 class="text-2xl font-semibold mb-4">Rate Our App</h1>
            <p class="text-gray-600 mb-6">We value your feedback! Please rate our app and let us know how we’re doing.</p>

            <div class="flex items-center mb-6">
                <span class="text-lg font-medium text-gray-700 mr-4">Rating:</span>
                <div class="flex space-x-2">
                    <template v-for="i in 5" :key="i">
                        <button @click="rate(i)" class="text-2xl p-1 hover:text-yellow-300" v-hover-color="'#f0e5d8'">
                            <span :class="{ 'text-yellow-300': i <= rating }">★</span>
                        </button>
                    </template>
                </div>
            </div>

            <textarea v-model="comment" class="w-full h-24 border border-gray-300 rounded-lg p-2 mb-4" placeholder="Write your comments here..."></textarea>

            <button @click="submitRating" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg">
                Submit Rating
            </button>
        </div>
    </div>
</template>

<style scoped>
</style>