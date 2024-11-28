import { defineStore } from 'pinia';
import axios from 'axios';

interface UserState {
    user: any;
    error: string;
}

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        error: '',
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
    },
    actions: {
        async register(username: string, password: string) {
            try {
                const response = await axios.post('http://localhost:3000/users/register', { username, password });
                this.user = response.data;
                localStorage.setItem('user', JSON.stringify(this.user));
                this.error = '';
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    if (error.response && error.response.status === 409) {
                        this.error = 'User already exists';
                    } else {
                        this.error = 'An error occurred';
                    }
                } else {
                    this.error = 'An unknown error occurred';
                }
            }
        },
        async login(username: string, password: string) {
            try {
                const response = await axios.post('http://localhost:3000/users/login', { username, password });
                this.user = response.data;
                localStorage.setItem('user', JSON.stringify(this.user));
                this.error = '';
            } catch (error: any) {
                if (axios.isAxiosError(error)) {
                    if (error.response && error.response.data.message) {
                        this.error = error.response.data.message;
                    } else {
                        this.error = 'An error occurred';
                    }
                } else {
                    this.error = 'An unknown error occurred';
                }
            }
        },
        logout() {
            this.user = null;
            localStorage.removeItem('user');
        },
    },
});