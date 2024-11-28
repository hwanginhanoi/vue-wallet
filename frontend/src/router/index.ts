import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/auth';

import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Currency from "../views/Currency.vue";
import Register from "../views/Register.vue";
import Index from "../views/Index.vue";
import PageNotFound from "../views/PageNotFound.vue";
import Transactions from "../views/Transactions.vue";
import Category from "../views/Category.vue";
import Rating from "../views/Rating.vue";

const routes = [
    { path: '/', name: 'index', component: Index},
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'register', component: Register },
    { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/currency', name: 'currency', component: Currency, meta: { requiresAuth: true } },
    { path: '/transactions', name: 'transactions', component: Transactions, meta: { requiresAuth: true } },
    { path: '/category', name: 'category', component: Category, meta: { requiresAuth: true }},
    { path: '/rating', name: 'rating', component: Rating, meta: { requiresAuth: true }},
    { path: '/:pathMatch(.*)*', name:'404', component: PageNotFound }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _, next) => {
    const userStore = useUserStore();
    const isAuthenticated = userStore.isAuthenticated;

    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
        next('/index');
    } else if (to.name === 'Login' && isAuthenticated) {
        next('/dashboard');
    } else {
        next();
    }
});

export default router;