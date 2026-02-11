# 🚀 Plan de Migración a React (PWA & Mobile First)

Este documento detalla la hoja de ruta para migrar la totalidad de AnimalConnect a una arquitectura **React + Vite + TypeScript**, cumpliendo con los estándares de **PWA (Progressive Web App)** y la nueva identidad visual **Bio-Tech Humanista**.

---

## 📅 Estructura del Proyecto (Sprints)

El trabajo se dividirá en 5 Sprints lógicos. Cada Sprint tiene un objetivo entregable y verificable.

### 🏁 Sprint 1: Cimientos y Rebranding (Fundamentos)
**Objetivo:** Establecer el Design System, configurar PWA y migrar lo existente al nuevo estilo.

1.  **Configuración del Entorno Mobile First:**
    - [ ] Configurar `tailwind.config.js` con la paleta *Vital-Ecosystem* (Bio-Teal, Living Coral, etc.).
    - [ ] Configurar tipografías (Nunito / Inter).
    - [ ] Instalar `lucide-react` y remover FontAwesome.
    - [ ] Instalar `framer-motion` para micro-interacciones.

2.  **Infraestructura PWA:**
    - [ ] Configurar `vite-plugin-pwa`.
    - [ ] Generar `manifest.json` (Iconos, colores de tema, `display: standalone`).
    - [ ] Configurar Service Workers básicos para caché offline.

3.  **Refactorización de Componentes Existentes:**
    - [ ] **Navbar:** Rediseñar para usar el nuevo esquema de colores y Lucide Icons.
    - [ ] **Auth:** Actualizar Login/Register con la nueva estética (Inputs grandes, bordes redondeados).
    - [ ] **ClinicaWizard:** Adaptar al nuevo branding y asegurar usabilidad táctil (>48px buttons).

---

### 🐾 Sprint 2: Núcleo Ciudadano (Módulo Público)
**Objetivo:** Que el ciudadano pueda buscar, adoptar y reportar mascotas desde el celular.

1.  **Home & Landing:**
    - [ ] Migrar `index.html` a `Pages/Home.tsx`.
    - [ ] Implementar "Widget de Guardia" y accesos rápidos.

2.  **Maps & Geolocalización:**
    - [ ] Crear componente reutilizable `MapContainer` (Leaflet) optimizado para móvil.
    - [ ] Implementar lógica de *Clustering* para marcadores.
    - [ ] Migrar lógica de filtros georreferenciados (Radio km).

3.  **Wizards de Reporte:**
    - [ ] Implementar `ReporteMascotaWizard` (Perdido/Encontrado).
    - [ ] Implementar `AdopcionWizard`.
    - [ ] Integrar carga de imágenes (Compresión en cliente antes de subir).

4.  **Feed de Adopción:**
    - [ ] Crear tarjetas de mascota con "Badges de Compatibilidad".
    - [ ] Implementar vista de detalle (Modal o Página) con botón de WhatsApp.

---

### 🩺 Sprint 3: Ecosistema Profesional (Veterinarios)
**Objetivo:** Herramientas para clínicas y gestión de turnos.

1.  **Perfil Profesional:**
    - [ ] Migrar Dashboard de Veterinario (`perfil.html`).
    - [ ] Implementar gráficos con `Recharts` (Estadísticas de consultas).

2.  **Gestión de Clínicas:**
    - [ ] Finalizar `ClinicaWizard` (si faltan detalles de lógica).
    - [ ] Implementar "Toggle de Guardia" (Lógica de turno activo).

3.  **Agenda & Pacientes (Futuro):**
    - [ ] Dejar preparada la estructura para gestión de historias clínicas (Layout de alta densidad).

---

### 🏠 Sprint 4: Comunidad y ONGs
**Objetivo:** Gestión de tránsitos y red de contención.

1.  **Módulo ONGs:**
    - [ ] Migrar `ong-wizard.html`.
    - [ ] Crear Dashboard de ONG (Validación de tránsitos).

2.  **Red de Hogares de Tránsito:**
    - [ ] Migrar `hogar-wizard.html`.
    - [ ] Implementar mapa privado de hogares (Solo visible para ONGs).

3.  **Comunidad:**
    - [ ] Migrar Foro y Muro de "Finales Felices".
    - [ ] Implementar sistema de comentarios y reputación.

---

### 🛍️ Sprint 5: Marketplace y Optimización Final
**Objetivo:** Monetización y performance extrema.

1.  **Marketplace:**
    - [ ] Migrar `tiendas.html` a una vista de mapa + lista (Bottom Sheet en móvil).
    - [ ] Implementar `ComercioWizard`.
    - [ ] Crear catálogo de productos con "Mini-Tienda" modal.

2.  **Optimización (Performance & SEO):**
    - [ ] Auditoría Lighthouse (Meta: 100/100 en Performance).
    - [ ] Implementar *Lazy Loading* de rutas y componentes pesados.
    - [ ] Optimizar imágenes (WebP).

3.  **Testing Final:**
    - [ ] Pruebas de usabilidad en dispositivos reales (Android/iOS).
    - [ ] Validación de flujos offline.

---

## 🛠️ Stack Tecnológico Definido

- **Core:** React 18+ (Hooks), TypeScript, Vite.
- **Estado:** Context API (Auth), React Query (Server State - Recomendado).
- **UI/UX:** Tailwind CSS, Framer Motion, Lucide React.
- **Mapas:** React-Leaflet + Leaflet.markercluster.
- **PWA:** Vite PWA Plugin.
- **Gráficos:** Recharts.
- **Formularios:** React Hook Form + Zod (Recomendado para validación).

## 📝 Próximos Pasos Inmediatos (Para el Usuario)

1.  Aprobar este plan.
2.  Iniciar **Sprint 1: Tarea 1 (Configuración del Entorno)**.
