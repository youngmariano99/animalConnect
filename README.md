# 🐾 Animal Connect: Sistema Integral de Gestión de Zoonosis

> **Propuesta Tecnológica para la Modernización de la Gestión de Fauna Urbana.**

## 📄 Descripción del Proyecto
**Animal Connect** es una plataforma web diseñada para centralizar, optimizar y digitalizar la gestión de animales en situación de calle y mascotas en una comunidad.

El sistema conecta tres actores claves: **El Municipio (Zoonosis)**, las **Organizaciones de Rescate** y los **Ciudadanos**, transformando reportes informales en datos geolocalizados para la toma de decisiones estratégicas de salud pública, a la vez que fomenta la adopción responsable mediante algoritmos de compatibilidad.

---

## 🎯 Visión y Objetivos

El objetivo principal es proveer una solución tecnológica eficiente y escalable para un municipio de aprox. 30.000 habitantes, abordando las siguientes problemáticas:

1.  **Inteligencia de Datos:** Permitir al municipio visualizar "Mapas de Calor" sobre problemáticas animales para optimizar recursos (ej. campañas de castración).
2.  **Eficiencia en Adopciones:** Reemplazar el caos de las redes sociales con un sistema centralizado que utiliza filtros de compatibilidad (Espacio, Tiempo, Tipo de mascota).
3.  **Seguridad y Rapidez:** Agilizar el reencuentro de mascotas perdidas mediante geolocalización en mapas interactivos.

---

## 🛠 Tech Stack (Tecnologías)

Este proyecto utiliza una arquitectura moderna, escalable y segura, dividida en Backend (API) y Frontend (Cliente).

### Backend
* **Lenguaje:** C# (.NET 8).
* **Framework:** ASP.NET Core Web API.
* **ORM:** Entity Framework Core.
* **Base de Datos:** SQL Server.

### Frontend
* **Lenguaje:** JavaScript (ES6+).
* **Estructura:** HTML5 Semántico.
* **Estilos:** Tailwind CSS (Diseño Mobile-First y moderno).
* **Librerías Claves:**
    * `Leaflet.js`: Para mapas interactivos y geolocalización.
    * `Chart.js`: Para visualización de estadísticas municipales.
    * `Fetch API`: Para consumo de servicios REST.

---

## 📋 Requisitos del Sistema (MVP)

### Requisitos Funcionales

#### Módulo Público (Ciudadanos)
1.  **Catálogo de Adopción:** Búsqueda de animales con filtros avanzados.
2.  **Sistema de Reportes:** Capacidad de reportar mascotas perdidas/encontradas marcando la ubicación exacta en el mapa y subiendo una fotografía.
3.  **Visualización de Campañas:** Acceso al calendario del Castrador movil Municipal.
4.  **Contacto Directo:** Integración con WhatsApp API para contactar al refugio o dueño.

#### Módulo Administrativo (Zoonosis/Admin)
1.  **Autenticación:** Login seguro para personal autorizado.
2.  **Gestión de Animales (CRUD):** Alta, baja y modificación de fichas médicas y de adopción.
3.  **Dashboard de Gestión:** Panel con métricas y Mapa de Calor (Heatmap) de incidentes.
4.  **Gestión de Eventos:** Administración de fechas de castración y vacunación.

### Requisitos No Funcionales
* **Usabilidad:** Diseño 100% Responsivo (Mobile First).
* **Performance:** Optimización de carga de imágenes.
* **Seguridad:** Hashing de contraseñas y validación de datos en servidor.
* **Escalabilidad:** Arquitectura desacoplada (API REST) preparada para futuras apps móviles.

---

## 🗓 Historias de Usuario (Priorizadas)

Utilizando la metodología **MoSCoW** para el MVP:

### 🔴 High Priority (Must Have)
* **HU-01 (Admin):** Quiero ingresar al sistema (Login) para proteger la integridad de los datos.
* **HU-02 (Admin):** Quiero dar de alta un animal (foto, descripción, estado) para publicarlo.
* **HU-03 (Ciudadano):** Quiero ver un listado de animales para adoptar.
* **HU-04 (Ciudadano):** Quiero reportar un animal perdido marcando su ubicación en el mapa.

### 🟡 Medium Priority (Should Have)
* **HU-05 (Ciudadano):** Quiero filtrar animales por características (tamaño, espacio necesario) para encontrar una mascota compatible ("Match").
* **HU-06 (Zoonosis):** Quiero ver un mapa de calor con las zonas de mayores reportes para planificar intervenciones.
* **HU-07 (Ciudadano):** Quiero un botón de contacto rápido (WhatsApp) en la ficha del animal.

### 🟢 Low Priority (Could Have)
* **HU-08 (Admin):** Quiero gestionar y publicar un calendario de castraciones.

---

## 🚀 Roadmap de Desarrollo (Sprints)

Planificación basada en metodología ágil (adaptada para desarrollador único).

* **Sprint 1: Cimientos**
    * Diseño de DER (Base de datos).
    * Configuración de proyecto .NET y SQL Server.
    * Autenticación básica.
* **Sprint 2: Core Backend**
    * API Endpoints para Animales (CRUD).
    * Manejo de subida de imágenes.
* **Sprint 3: Frontend Público**
    * Diseño UI con Tailwind CSS.
    * Consumo de API (Listado y Filtros).
* **Sprint 4: Geolocalización**
    * Integración de Leaflet.js.
    * Lógica de marcadores y reportes geolocalizados.
* **Sprint 5: Admin & Analytics**
    * Dashboard administrativo.
    * Implementación de gráficos y Heatmap.
    * Deploy y pruebas finales.

---
*Desarrollado para la Tecnicatura Superior en Programación - 2024/2025.*