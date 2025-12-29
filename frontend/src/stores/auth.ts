import { defineStore } from 'pinia';
import { ref } from 'vue';
import client from '@/api/client';

export interface User {
    id: number;
    username: string;
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(sessionStorage.getItem('token'));
    const user = ref<User | null>(null);

    const setToken = (newToken: string) => {
        token.value = newToken;
        sessionStorage.setItem('token', newToken);
    };

    const setUser = (newUser: User) => {
        user.value = newUser;
    };

    const logout = async () => {
        try {
            await client.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            token.value = null;
            user.value = null;
            sessionStorage.removeItem('token');
        }
    };

    const login = async (username: string, password: string) => {
        const { data } = await client.post<{ accessToken: string; user: User }>('/auth/login', {
            username,
            password,
        });
        setToken(data.accessToken);
        setUser(data.user);
    };

    const register = async (username: string, password: string, confirmPassword: string) => {
        await client.post('/auth/register', {
            username,
            password,
            confirmPassword,
        });
    };

    const fetchUser = async () => {
        if (!token.value) return;
        try {
            const { data } = await client.get<User>('/auth/me');
            setUser(data);
        } catch (error) {
            logout();
        }
    };

    return {
        token,
        user,
        setToken,
        setUser,
        logout,
        login,
        register,
        fetchUser,
    };
});
