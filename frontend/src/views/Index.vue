<script setup lang="ts">
import RatingCard from "../components/RatingCard.vue";

import {ref, onMounted, computed} from 'vue';
import axios from 'axios';

const feedbacks = ref<{ id: number; userId: number, rating: number; comment: string, createdAt : Date }[]>([]);

const fetchFeedbacks = async () => {
    try {
        const response = await axios.get('http://localhost:3000/ratings/random');
        feedbacks.value = response.data.feedbacks;
    } catch (error) {
        console.error('Failed to fetch feedbacks:', error);
    }
};

const currentSlide = ref(0);

const totalSlides = computed(() => feedbacks.value.length);

const carouselStyle = computed(() => {
    return `transform: translateX(-${currentSlide.value * 100}%)`;
});

const nextSlide = () => {
    if (currentSlide.value < totalSlides.value - 1) {
        currentSlide.value++;
    } else {
        currentSlide.value = 0;
    }
};

const prevSlide = () => {
    if (currentSlide.value > 0) {
        currentSlide.value--;
    } else {
        currentSlide.value = totalSlides.value - 1;
    }
};

onMounted(() => {
    fetchFeedbacks();
});
</script>

<template>
    <div>
        <div class="flex flex-row min-h-screen justify-center items-center">
            <div class="gap-8 items-center py-8 px-4 mx-auto max-w-screen-xl xl:gap-16 md:grid md:grid-cols-2 sm:py-16 lg:px-6">
                <img class="w-full" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup.svg"
                     alt="dashboard image">
                <img class="w-full hidden"
                     src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/cta/cta-dashboard-mockup-dark.svg"
                     alt="dashboard image">
                <div class="mt-4 md:mt-0">
                    <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">The <span class="vue-accent">Progressive</span> Fintech App</h2>
                    <p class="mb-6 font-light text-gray-500 md:text-lg">Ready to take control of your financial future?
                        Join us today and experience the ease of managing your finances with just a few clicks.
                        Sign up now to start your financial journey with our intuitive and secure platform.
                        Whether you want to save, invest, or simply manage your expenses better, our app provides all the tools you need.
                        Create your account in minutes and discover how easy financial empowerment can be. Don’t wait – secure your future with us today!
                    </p>
                    <RouterLink to="/login"
                                class="inline-flex items-center text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Get started
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
    <div class="relative w-full max-w-4xl mx-auto">
        <h1 class="text-4xl font-extrabold mb-6 text-gray-900">Customer Feedback</h1>
        <div class="overflow-hidden relative">
            <div class="flex transition-transform duration-300 ease-in-out" :style="carouselStyle">
                <div v-for="feedback in feedbacks" :key="feedback.id" class="flex-shrink-0 w-full">
                    <RatingCard :feedback="feedback" />
                </div>
            </div>
            <button @click="prevSlide" class="absolute left-5 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white p-2 rounded-full shadow-md">
                &#10094;
            </button>
            <button @click="nextSlide" class="absolute right-5 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white p-2 rounded-full shadow-md">
                &#10095;
            </button>
        </div>
    </div>

</template>

<style scoped>

.vue-accent {
    background: linear-gradient(315deg, #42d392 25%, #647eff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

</style>