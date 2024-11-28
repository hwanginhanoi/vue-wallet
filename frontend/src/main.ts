import App from './App.vue'
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css'
import router from "./router";
import VueApexCharts from "vue3-apexcharts";
import {useUserStore} from "./stores/auth.ts";
import {hoverColorDirective} from "./directive/hover.ts";


const app = createApp(App);
const pinia = createPinia();


app.use(pinia);
app.use(router);
app.use(VueApexCharts);
app.mount('#app')
app.directive('hover-color', hoverColorDirective);


const userStore = useUserStore();
if (userStore.isAuthenticated) {
    await router.push('/dashboard');
}

