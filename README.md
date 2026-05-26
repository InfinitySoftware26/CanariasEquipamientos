# Canarias Equipamientos - Sistema de Gestión

Este proyecto es un sistema de gestión de cobranza y ventas financiadas, desarrollado con **NestJS (backend)**, **React/Next (frontend)** y **PostgreSQL (base de datos)**.  
Todo el stack se levanta con **Docker Compose** para asegurar entornos consistentes entre desarrolladores.

---

## 🚀 Requisitos previos
- Docker Desktop instalado
- Git para clonar el repositorio

---

## 📦 Instalación y ejecución

1. Clonar el repositorio:
   git clone https://github.com/tu-org/CanariasEquipamientos.git
   cd CanariasEquipamientos

2. Instalar `pnpm` si aún no está disponible:
   pnpm install -g pnpm

3. Instalar dependencias en todo el monorepo:
   pnpm install

4. Ejecutar en modo desarrollo:
   cd backend
   pnpm run start:dev

   cd ../canarias-frontend
   pnpm dev

> Este repositorio usa `pnpm` en modo monorepo. No usar `npm` ni `yarn`.

