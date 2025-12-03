# 🐾 Animal Connect: Sistema Integral de Gestión de Zoonosis

> **Plataforma Integral de Gestión de Zoonosis, Adopción Inteligente y Red Profesional.**

## 📄 Descripción del Proyecto
**Animal Connect** ha evolucionado de un simple registro de mascotas a un **Ecosistema de Salud Pública** completo. Es una plataforma web diseñada para centralizar y profesionalizar la gestión de la fauna urbana en comunidades medianas.


El sistema conecta ahora a **cuatro actores estratégicos**:
1.  **El Municipio (Zoonosis):** Para inteligencia de datos y control sanitario.
2.  **Veterinarios y Profesionales:** Integrados como agentes de salud verificados.
3.  **Organizaciones de Rescate:** Para la gestión eficiente de tránsitos.
4.  **Ciudadanos:** Empoderados con herramientas de reporte y adopción.

---

## 🎯 Visión y Soluciones

El proyecto aborda problemáticas reales con tecnología escalable:

1.  **Red de Salud Profesional (Nuevo):** Digitalización del directorio veterinario y sistema automatizado de **"Farmacia de Turno"** geolocalizada para urgencias.
2.  **Seguridad Ciudadana:** Validación de identidad para profesionales (Matrícula/Bio) para evitar fraudes y garantizar confianza en la comunidad.
3.  **Inteligencia de Datos:** "Mapas de Calor" para que el municipio optimice recursos en campañas de castración y vacunación.
4.  **Adopción Eficiente (Match):** Algoritmos de compatibilidad que conectan mascotas con dueños ideales según estilo de vida, reduciendo la tasa de devolución.

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

## 📋 Módulos del Sistema (V2.0)

### 1. Módulo Público (Ciudadanos)
* **Mapa de Salud:** Visualización en tiempo real de veterinarias y campañas de salud.
* **Widget de Guardia:** Aviso destacado en la navegación con la veterinaria de turno y conexión directa a WhatsApp.
* **Reportes Geolocalizados:** Sistema de alertas para mascotas perdidas/encontradas con ubicación exacta en mapa.
* **Adopción & Match:** Catálogo con filtros avanzados y cálculo de compatibilidad (%).

### 2. Módulo Profesional (Veterinarios)
* **Perfil Verificado:** Registro con validación de matrícula y datos biométricos (Logo, Bio).
* **Gestión de Presencia:** Configuración de horarios de atención y ubicación comercial.
* **Visibilidad:** Destacado automático en el mapa al estar de turno.

### 3. Módulo Administrativo (Zoonosis/Gobierno)
* **Centro de Validación:** Panel para aprobar o rechazar solicitudes de nuevos profesionales.
* **Gestión de Turnos:** Control centralizado de la "Veterinaria de Guardia" (Toggle On/Off).
* **Dashboard de Métricas:** Gráficos de especies, estados y mapas de calor de incidentes.
* **Gestión de Campañas:** Publicación de eventos de castración móvil.

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

### 🔄 FASE 2: SHOWCASE (Actual)
* **Sprint A: Identidad Profesional (Completado)**
    * Roles de Usuario (Vet/Vecino).
    * Registro con Mapa Interactivo (Leaflet Picker).
    * Panel de Aprobación de Veterinarios.
    * Sistema de Guardia/Turnos.
* **Sprint B: Ciclo de Vida y UX (En Progreso)**
    * Separación lógica Perdidos vs. Adopción.
    * Panel "Mis Publicaciones".
    * Estados finales (Encontrado/Adoptado).
* **Sprint C: Comunidad**
    * Foro de dudas y consultas.
    * Muro de "Finales Felices".
    * Gamificación para usuarios activos.


---
*Proyecto desarrollado para la Tecnicatura Superior en Programación - 2024/2025.*