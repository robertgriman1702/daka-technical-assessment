# Multi-Stage Build para Frontend

# TODO: STAGE 1 - Build
# imagen base: node:20-slim
# pasos: install dependencies -> build (vite build)
FROM node:20-slim AS builder

WORKDIR /app
# ... completar build ...


# TODO: STAGE 2 - Production Server
# imagen base: nginx:alpine
# pasos:
# 1. Copiar archivos compilados de /app/dist (builder) a /usr/share/nginx/html
# 2. Exponer puerto 80 (o configurar custom nginx.conf)
# 3. Nginx corre automáticamente
FROM nginx:alpine

# ... completar copy ...
