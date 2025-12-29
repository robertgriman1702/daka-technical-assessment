# Prueba Técnica Full-Stack: Tiendas DAKA - Auth & Pokémon Sprites

Este proyecto es una solución completa para el reto técnico de Tiendas DAKA. Implementa un sistema robusto de autenticación y una aplicación en tiempo real para visualizar sprites de Pokémon, demostrando habilidades en desarrollo Full Stack con **NestJS** y **Vue.js**, uso de contenedores **Docker**, y diseño moderno con **Tailwind CSS**.

---

## 🚀 Tecnologías Utilizadas

### Frontend (Cliente)
-   **Framework**: [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Diseño responsivo y animaciones personalizadas)
-   **State Management**: [Pinia](https://pinia.vuejs.org/) (Gestión de sesión y usuario)
-   **Data Fetching**: [TanStack Query (Vue Query)](https://tanstack.com/query/latest) (Gestión eficiente del estado asíncrono y caché)
-   **Routing**: [Vue Router](https://router.vuejs.org/) (Navegación y protección de rutas)
-   **Form Validation**: [Vee-Validate](https://vee-validate.logaretm.com/) + [Zod](https://zod.dev/) (Validación de esquemas estricta)
-   **Real-time**: [Socket.io Client](https://socket.io/) (Comunicación bidireccional para sprites)

### Backend (Servidor)
-   **Framework**: [NestJS](https://nestjs.com/) (Arquitectura modular y escalable)
-   **Database ORM**: [TypeORM](https://typeorm.io/)
-   **Database**: PostgreSQL
-   **Authentication**:
    -   [Passport-JWT](https://docs.nestjs.com/security/authentication) (Estrategia Bearer)
    -   **JWT Blocklist**: Implementación en memoria para invalidación real de tokens al cierre de sesión.
-   **Real-time**: NestJS Gateway (WebSocket con autenticación integrada)
-   **API Documentation**: Swagger (Configurado base)

### Infraestructura & DevOps
-   **Docker**: Contenedorización completa de servicios.
-   **Docker Compose**: Orquestación de Frontend, Backend y Base de datos con **Hot-Reload** habilitado para desarrollo fluido.

---

## ✨ Características Implementadas (Plus +)

Además de los requerimientos base, se han añadido múltiples mejoras para elevar la calidad y experiencia de usuario:

### 🔐 Autenticación Avanzada
-   **Flujo Completo**: Registro, Inicio de Sesión y **Cierre de Sesión seguro**.
-   **Seguridad Mejorada**: Las contraseñas se visualizan con toggle (ojo) y se validan con esquemas Zod robustos.
-   **Logout Real**: Al cerrar sesión, el token JWT se añade a una "Blocklist" en el backend, impidiendo su reutilización inmediata.
-   **Rutas Protegidas**: *Guards* globales en Frontend y Backend aseguran que solo usuarios autenticados accedan al Dashboard.

### ⚡ Dashboard Interactivo (Pokémon Sprites)
-   **WebSockets con Auth**: La conexión Socket.io se autentica automáticamente con el JWT del usuario.
-   **Animaciones Fluidas**:
    -   *Staggered List Entrance*: Los sprites aparecen en cascada suavemente.
    -   *Modales Animados*: Transiciones de entrada/salida y escala para modales.
-   **Paginación Cliente**: Control total de la visualización (12, 24, 36 items) con corrección automática de estado.
-   **Preview de Imagen**: Modal para visualizar el sprite en alta resolución al hacer clic.
-   **Gestión de Datos**:
    -   **Delete All**: Funcionalidad para limpiar toda la lista de un golpe.
    -   **Optimistic Updates**: La interfaz reacciona instantáneamente a las acciones del usuario.

### 🎨 UI/UX Moderna
-   **Diseño Premium**: Interfaz limpia tipo "Glassmorphism" sutil, sombras suaves y bordes redondeados.
-   **Feedback Visual**:
    -   Indicadores de carga (Spinners).
    -   Validación de formularios en tiempo real con bordes rojos/verdes.
-   **Responsive**: Adaptable a móviles y escritorio (Grid system).

---

## 📂 Arquitectura del Proyecto

### Estructura Backend (`/backend`)
```bash
src/
├── auth/           # Módulo de Autenticación
│   ├── strategies/ # JWT Strategy (con validación de Blocklist)
│   ├── guards/     # Guardias de rutas
│   └── ...
├── pokemon/        # Módulo Principal de Negocio
│   ├── pokemon.gateway.ts  # Manejo de WebSockets
│   ├── pokemon.service.ts  # Lógica de negocio y PokeAPI
│   └── ...
└── main.ts         
```

### Estructura Frontend (`/frontend`)
```bash
src/
├── api/            # Configuración de Axios
├── views/          # Páginas (Login, Register, Dashboard, Home)
├── components/     # Componentes reutilizables
├── stores/         # Pinia Stores (Auth)
├── assets/         # Estilos (Tailwind Base)
└── main.ts         # Configuración de Vue
```

---

## 🚀 Cómo Ejecutar el Proyecto

El proyecto está totalmente dockerizado para facilitar su ejecución.

1.  **Requisitos Prerrequisitos**: Tener instalado Docker y Docker Compose.
2.  **Clonar el repositorio**.
3.  **Iniciar la aplicación**:

    Desde la raíz del proyecto, ejecuta:

    ```bash
    docker-compose up --build
    ```

4.  **Acceder a la Aplicación**:
    -   **Frontend**: [http://localhost:5173](http://localhost:5173)
    -   **Backend API**: [http://localhost:3000](http://localhost:3000)

.env Backend 

POSTGRES_DB=technical-test_db
POSTGRES_USER=technical-test
POSTGRES_PASSWORD=1234
POSTGRES_INITDB_ARGS="--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
DATABASE_USER=technical-test
DATABASE_PASSWORD=1234
DATABASE_NAME=technical-test_db

.env Frontend

VITE_API_URL=http://localhost:3000