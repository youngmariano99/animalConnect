# 🔎 Análisis General del Proyecto AnimalConnect

## 1. Arquitectura del Sistema

El sistema sigue una arquitectura de **Monolito Modular** con una separación clara entre Backend (API) y Frontend (Cliente), diseñada para ser escalable y geolocalizada.

### Backend (Core)
- **Tecnología:** .NET 8/9 con ASP.NET Core Web API.
- **Base de Datos:**
    - Originalmente SQL Server, con evidencia de migración a **PostgreSQL** (según Sprint D).
    - Uso de **Entity Framework Core 9** con enfoque *Code First*.
- **Patrones Clave:**
    - **Repository Pattern (implícito):** Uso de Controllers como puntos de entrada y Servicios para lógica compleja.
    - **DTOs:** Transferencia de datos optimizada.
    - **Dependecy Injection:** Configuración centralizada en `Program.cs`.
- **Servicios Externos/Integraciones:**
    - **Almacenamiento:** Sistema de archivos local (`wwwroot/uploads`) servido como estáticos.
    - **Geolocalización:** `GeoService` propio basado en fórmula Haversine para filtrado por radio.

### Frontend
Existen dos implementaciones del frontend en diferentes estados de madurez:
1.  **Vanilla JS (Legacy/Stable):** HTML5, CSS (Tailwind), y JavaScript nativo (ES6+).
2.  **React (Migration/Alpha):** Vite, React, TypeScript.

---

## 2. Funcionalidades Principales

El sistema conecta a 4 actores clave: **Ciudadanos, Veterinarios, ONGs y Gobierno**.

### 👤 Módulo Ciudadano
- **Autenticación:** Login/Registro con JWT.
- **Mascotas Perdidas/Encontradas:** Reportes geolocalizados con mapa interactivo (Leaflet).
- **Adopción Inteligente (Match):**
    - Algoritmo de "Scoring Ponderado" que calcula % de compatibilidad.
    - Filtros por atributos (Energía, Espacio, etc.).
- **Tiendas/Servicios:** Visualización de comercios cercanos y pedidos por WhatsApp.

### 🩺 Módulo Profesional (Veterinarios/Clínicas)
- **Perfil Profesional:** Validación de matrícula y datos biométricos.
- **Consultorio Digital:** Gestión de horarios y ubicación.
- **Sistema de Guardia:** Lógica de "Farmacia de Turno" única por zona (Lazy Cleanup para auto-desactivación tras 24hs).

### 🏢 Módulo Organizaciones (ONGs) y Tránsitos
- **Red de Hogares:** Mapa privado de hogares de tránsito validado.
- **Gestión de Estados:** Semáforo de disponibilidad (Activo, Por Vencer, Vencido).
- **Higiene de Datos:** Auto-ocultamiento de hogares inactivos > 30 días.

### 🏛️ Módulo Administrativo (Gobierno/Zoonosis)
- **Dashboard:** Métricas, gráficos (Chart.js) y Mapas de Calor (Heatmap) de incidentes.
- **Centro de Aprobaciones:** Validación manual de profesionales y ONGs.
- **Campañas de Salud:** Gestión de castraciones/vacunación itinerante.

---

## 3. Características Destacadas (Features Técnicas)

1.  **Algoritmo de Match (Weighted Scoring):**
    - No es un filtro booleano simple. Calcula distancia vectorial entre preferencias del usuario y atributos del animal.
    - Diferencia exacta = 100% puntaje. Aproximada = 50%. Lejana = 0%.

2.  **Geolocalización Nativa:**
    - Todo el sistema gira en torno a la ubicación (`Lat/Lng`).
    - Filtros de radio (ej: "Mostrar mascotas a 50km").
    - Ordenamiento por distancia en listados.

3.  **Higiene Automática de Datos:**
    - **TTL (Time To Live):** Publicaciones y turnos caducan lógicamente para no "ensuciar" el mapa.
    - **Soft Deletes:** Los registros importantes no se borran físicamente, cambian de estado.

4.  **Optimización de Carga:**
    - Uso de *Client-Side Rendering* para mapas.
    - JSON serializado con `ReferenceHandler.IgnoreCycles` para evitar loops infinitos en relaciones complejas.

---

## 4. Estado de los Frontends

Aquí se detalla la situación actual de las dos carpetas de frontend encontradas.

### 🟢 Frontend 1: Vanilla JS (`AnimalConnect.Frontend`)
**Estado:** ✅ **Completo y Funcional (Producción)**

Es la versión estable que refleja todo lo documentado en `DOCS_TECNICA.md` y `SprintLogs.md`.
- **Arquitectura:** SPA simulada (Single Page Application) usando manipulación del DOM y ocultamiento de secciones (`display: none`).
- **Cobertura:** 100% de las funcionalidades (Admin, ONGs, Mapas, Wizard de Comercios, etc.).
- **Archivos Clave:**
    - `index.html`: App pública principal.
    - `admin.html`, `superadmin.html`: Paneles de gestión.
    - `*_wizard.html`: Flujos de alta complejos (Clinica, Comercio, Hogar).

### 🟠 Frontend 2: React (`animal-connect-frontend`)
**Estado:** 🚧 **En Migración (Aprox. 30-40%)**

Es una reescritura moderna utilizando **Vite + React + TypeScript**.
- **Lo que SÍ está migrado:**
    - Estructura base del proyecto y Routing (`react-router-dom`).
    - **Auth:** Login y Registro (`Login.tsx`, `Register.tsx`).
    - **Core Usuario:** Perfil (`Perfil.tsx`), Home (`Home.tsx`) y Adopción (`Adopcion.tsx`).
    - **Wizard Clínica:** `ClinicaWizard.tsx` (Parece ser el único wizard complejo migrado).
- **Lo que FALTA migrar:**
    - **Módulos Administrativos:** No hay rastro de Dashboard, Admin o SuperAdmin.
    - **Ecosistema Comercial:** Faltan `Tiendas`, `ComercioWizard`.
    - **Ecosistema ONGs:** Faltan `OngWizard`, `PanelOng`.
    - **Comunidad:** No está el Foro ni funcionalidades sociales.
    - **Campañas:** Falta módulo de Salud.

### 💡 Recomendación
Si el objetivo es desplegar o mostrar el producto completo **YA**, se debe utilizar la versión **Vanilla JS**. La versión React es una excelente inversión a futuro pero actualmente está incompleta para una demo integral de todas las funcionalidades (especialmente las de administración y marketplace).
