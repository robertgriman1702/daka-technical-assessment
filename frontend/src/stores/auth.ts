import { defineStore } from 'pinia';
import { ref } from 'vue';
import client from '@/api/client';

export interface User {
    id: number;
    username: string;
}

export const useAuthStore = defineStore('auth', () => {
    // TODO: Definir estado reactivo
    // const token = ref<string | null>(...);
    // const user = ref<User | null>(null);

    // TODO: Implementar acción de login
    // Requisitos:
    // 1. Llamar endpoint /auth/login
    // 2. Guardar token (evaluar seguridad: localStorage vs cookies)
    // 3. Actualizar estado de usuario
    const login = async (username: string, password: string) => {
        throw new Error('Not implemented');
    };

    // TODO: Implementar acción de registro
    const register = async (username: string, password: string, confirmPassword: string) => {
        throw new Error('Not implemented');
    };

    // TODO: Implementar logout
    // Requisitos:
    // 1. Llamar endpoint /auth/logout
    // 2. Limpiar token y estado de usuario
    const logout = async () => {
        throw new Error('Not implemented');
    };

    // TODO: Implementar fetchUser para persistencia de sesión
    const fetchUser = async () => {
        // Verificar token y traer perfil
    };

    return {
        // token,
        // user,
        login,
        register,
        logout,
        fetchUser,
    };
});
