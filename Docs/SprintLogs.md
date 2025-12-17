# 📂 Bitácora de Desarrollo - Sprint 1

**Objetivo:** Crear la estructura base del proyecto, configurar la base de datos y establecer la arquitectura del Backend.

## 📅 Fecha: [30/11/2025]

### 1. Definición del Modelo de Datos
Se diseñó un modelo relacional normalizado para garantizar la integridad de los datos.
- **Decisión Técnica:** Se separaron las tablas `Especies` y `Estados` para evitar redundancia de datos (Normalización).
- **Relaciones:** Se establecieron relaciones de "Uno a Muchos" (One-to-Many):
    - Una Especie puede tener muchos Animales.
    - Un Animal pertenece a una sola Especie.

### 2. Tecnologías Seleccionadas
- **Entity Framework Core (Code First):** Se eligió el enfoque "Code First" para definir la base de datos desde las clases de C#. Esto facilita el control de versiones de la base de datos mediante Migrations.

---

### 3. Implementación de Modelos (POCOs)
Se crearon las clases en la carpeta `Models` utilizando **Data Annotations** para definir restricciones de base de datos directamente desde el código.
- Se implementaron claves foráneas (Foreign Keys) explícitas (`IdEspecie`, `IdEstado`) junto con **Propiedades de Navegación** (`virtual Especie...`) para permitir que Entity Framework gestione las relaciones automáticamente.
- Se utilizaron tipos `double` para las coordenadas geográficas, compatibles con Leaflet.js.

### 4. Implementación de Carga de Imágenes (File Upload)
Se implementó un sistema para almacenar fotografías de las mascotas.
- **Estrategia:** Almacenamiento local en el servidor (File System) en la carpeta `wwwroot/uploads`.
- **Flujo:**
    1.  El cliente envía la imagen al endpoint `api/Archivos/subir`.
    2.  El servidor guarda el archivo físico con un nombre único (GUID) para evitar colisiones.
    3.  El servidor devuelve la URL pública de la imagen.
    4.  El cliente envía esa URL junto con los datos del animal al endpoint `api/Animales` (POST).

### 5. Configuración de Archivos Estáticos
Se habilitó el middleware `app.UseStaticFiles()` en `Program.cs` para permitir que el navegador o aplicaciones externas puedan visualizar las imágenes almacenadas en la carpeta `wwwroot`.

---
**✅ CIERRE DE SPRINT 1:** Backend funcional con base de datos, relaciones y manejo de multimedia.

### 6. Integración Frontend-Backend (CORS)
Para permitir que la página web (Frontend) consuma datos de la API (Backend), se configuró una política de **CORS (Cross-Origin Resource Sharing)**.
- **Configuración:** Se habilitó `AllowAnyOrigin` en el `Program.cs` del Backend. Esto permite que el navegador acepte respuestas de la API aunque vengan de dominios diferentes (ej: localhost:5500 vs localhost:5269).

### 7. Inicio Sprint 3: Frontend Público
Se creó la estructura base del cliente web (`index.html`) utilizando:
- **Tailwind CSS (CDN):** Para el diseño rápido y responsivo.
- **JavaScript (Fetch API):** Para realizar peticiones asíncronas al Backend.
- **Renderizado Dinámico:** Se implementó una función JS que recibe el JSON de animales e inyecta el HTML de las tarjetas en el DOM.

### 8. Integración de Mapas Interactivos (Leaflet.js)
Se implementó la visualización geolocalizada de mascotas.
- **Tecnología:** Librería `Leaflet.js` con tiles (mapas base) de OpenStreetMap.
- **Funcionalidad:**
    - Inicialización del mapa centrado en las coordenadas del municipio (-37.994, -61.353).
    - **Marcadores Dinámicos:** Al cargar o filtrar mascotas, se generan pines en el mapa.
    - **Interactividad:**
        - Click en marcador -> Muestra Popup con nombre y descripción.
        - Click en botón "Ver en Mapa" (Tarjeta) -> El mapa hace un vuelo suave (`flyTo`) hacia la ubicación y centra el marcador.

### 9. Módulo de Reporte Ciudadano (Modal + FormData)
Se implementó la funcionalidad para que los usuarios carguen nuevos reportes desde el Frontend.
- **Interfaz (UI):** Se creó un Modal flotante (oculto por defecto) que contiene el formulario de carga.
- **Selector Geográfico:** Se integró una segunda instancia de mapa (`L.map`) dentro del modal para permitir al usuario seleccionar la ubicación exacta haciendo clic (evento `click` -> captura `lat, lng`).
- **Manejo de Imágenes:** - Se utiliza `FormData` en JavaScript para enviar el archivo binario al endpoint `POST /api/Archivos/subir`.
    - Se recibe la URL y se adjunta al objeto JSON del animal.
- **Corrección de Infraestructura:** Se configuró el perfil de lanzamiento HTTP en el puerto 5269 y se ajustaron las llamadas `fetch` a `127.0.0.1` para evitar bloqueos de seguridad/CORS en navegadores modernos.

### 10. Módulo de Administración y Analítica (Dashboard)
Se desarrolló un panel de control (`admin.html`) orientado a la toma de decisiones municipales.
- **Visualización de Datos:**
    - Integración de **Chart.js** para gráficos de torta (distribución por especies).
    - Implementación de **Leaflet.heat** para generar Mapas de Calor (Heatmaps) basados en la densidad de reportes geolocalizados.
- **Gestión de Registros:**
    - Se habilitó el verbo `DELETE` en el controlador `AnimalesController`.
    - Se implementó la lógica de borrado en el Frontend con confirmación de seguridad.
- **Correcciones Técnicas:**
    - Se solucionó el error de "Map container already initialized" implementando una lógica de limpieza de instancias (`.remove()` / `.destroy()`) antes de recargar los componentes visuales.

### 11. Módulo de Campañas de Salud (Castrador Móvil)
Se implementó un sistema de gestión de eventos itinerantes.
- **Backend:** Nueva entidad `Campania` y controlador API para gestión de fechas.
- **Frontend:** Visualización dual (Lista + Mapa) donde al seleccionar una fecha, el mapa se centra en la ubicación del operativo.
- **Regla de Negocio:** Filtrado automático de fechas pasadas para mostrar solo vigentes.

### 12. Sistema de Autenticación y Roles
Se desarrolló un módulo de seguridad para diferenciar usuarios.
- **Roles:** `Administrador` (Acceso al Dashboard) y `Ciudadano` (Acceso al Match/Adopción).
- **Flujo de Usuario:**
    - Registro de cuenta nueva.
    - Redirección inteligente:
        - Si es nuevo -> `quiz.html` (Cuestionario obligatorio).
        - Si ya tiene perfil -> `index.html` (Home).
- **Persistencia:** Manejo de sesión mediante `localStorage` en el cliente.

### 13. Algoritmo de Adopción Inteligente (Sistema de Match)
**Funcionalidad Estrella:** Se implementó un motor de recomendación basado en compatibilidad etológica.
- **Refactorización de Arquitectura:** Se migró de columnas estáticas a un modelo **EAV (Entity-Attribute-Value)** mediante las tablas `Atributos`, `AnimalAtributos` y `PreferenciasAdoptante`. Esto permite agregar nuevas características (ej: "Tolera Ruidos") sin modificar el código fuente.
- **Algoritmo:** Lógica de **Puntuación Ponderada (Weighted Scoring)** en el Backend que compara el perfil del usuario con cada animal y genera un porcentaje de afinidad (0-100%).
- **UX:** Visualización de "Badges de Compatibilidad" (Verde/Amarillo/Rojo) en las tarjetas de adopción.

### 14. Estabilización Técnica (Hardening)
- **Corrección de Ciclos JSON:** Se configuró `ReferenceHandler.IgnoreCycles` en `Program.cs` para evitar errores de serialización en relaciones bidireccionales (Entidad <-> Atributo).
- **Reset de Base de Datos:** Se ejecutó una migración limpia (`InicialMatch`) con *Data Seeding* complejo para pruebas de demostración.

### 15. Refinamiento de UX y Segmentación de Interfaz
Se reestructuró el Frontend para diferenciar claramente los casos de uso.
- **Segmentación Pública (`index.html`):**
    - Implementación de **Navegación por Pestañas (Tabs):** "Reportes Perdidos", "Adopción & Match" y "Salud Móvil".
    - **Lógica de Visualización:** Se ocultan/muestran secciones del DOM (`classList.toggle`) para mejorar la performance sin recargar la página.
- **Formularios Dinámicos:**
    - **Modal de Reporte Inteligente:** Detecta la intención del usuario. Si es "Adopción", despliega campos avanzados (Energía, Tamaño); si es "Perdido", muestra solo lo básico.
    - **Panel Admin:** Se unificó la carga de animales en una vista "Ingreso" que adapta los campos según el estado seleccionado.
- **Integración Social:** Generación dinámica de enlaces a la API de **WhatsApp** (`wa.me`) pre-llenados con el mensaje de interés.


## 🚀 FASE 2: SHOWCASE (En Progreso)
*Transformación hacia una plataforma comunitaria, segura y profesional para la muestra municipal.*

---

### 📅 Sprint A: Identidad y Roles Profesionales (Completado)
**Estado:** ✅ Finalizado | **Fecha:** [03/12/2025]
**Objetivo:** Expandir el ecosistema para incluir Veterinarios con geolocalización y validación administrativa.

* [x] **Refactor de Usuarios (Modelado):**
    * Implementación de arquitectura de perfiles satélite (`PerfilVeterinario`, `PerfilCiudadano`) vinculados a la tabla `Usuario`.
    * Inclusión de campos profesionales: Matrícula, Horarios, Biografía y Logo.
* [x] **Registro Avanzado (UX/UI):**
    * Formulario dinámico en `register.html` que se adapta según el rol elegido.
    * **Selector de Ubicación:** Integración de mapa Leaflet en el registro para que los veterinarios marquen su consultorio con precisión (Lat/Lon).
* [x] **Sistema de Verificación (Seguridad):**
    * Los veterinarios nacen con estado `Pendiente`.
    * Bloqueo de login para cuentas no aprobadas.
    * Módulo en panel administrativo para Aprobar/Rechazar solicitudes.
* [x] **Mapa de Salud y Turnos:**
    * Visualización de veterinarias en el mapa público con icono distintivo (Cruz Azul).
    * **Sistema de Guardia:** Lógica de "Radio Button" en el backend para asignar una única veterinaria de turno.
    * **Widget de Guardia:** Aviso visual en el Navbar público que conecta directo al WhatsApp del profesional de turno.

---


### 📅 Sprint B: Ciclo de Vida y Separación de Flujos
**Objetivo:** Aislar "Pérdidas" de "Adopciones" y automatizar la higiene de datos.
* [x] **Separación Estricta:** Dividir formularios y vistas. El reporte de perdido no debe pedir datos de adopción y viceversa.
* [x] **Lógica "Marketplace":** Implementar fecha de vencimiento (15 días) y sistema de renovación de publicaciones.
* [x] **Estados Finales:** Reemplazar el borrado por cambios de estado (`Encontrado`, `Adoptado`, `Vencido`).
* [x] **Panel "Mis Publicaciones":** Área privada donde el usuario gestiona sus reportes (Renovar, Marcar Encontrado).

---

### 📅 Sprint C: Comunidad y Gamificación
**Objetivo:** Fomentar la retención de usuarios y crear una red de apoyo.
* [x] **Foro/Muro Comunitario:** Sección para "Dudas", "Finales Felices" y "Avisos".
* [x] **Interacción Profesional:** Distintivos visuales para comentarios de veterinarios verificados.
* [x] **Historias de Éxito:** Flujo automático para convertir un animal "Adoptado/Encontrado" en un post del muro.
* [x] **Gamificación:** Sistema básico de reputación o medallas por ayudar/adoptar.

---

### 📅 Sprint D: Pulido Visual y Match Detallado
**Objetivo:** Maximizar el impacto visual para la demo.
* [x] **Ficha de Animal v2:** Detalle profundo con visualización semáforo de compatibilidad (Match estricto vs flexible).
* [x] **Botón "Veterinaria de Turno":** Widget destacado en home gestionado por Admin.

---

### 📅 Sprint D: La Gran Migración y Arquitectura SaaS (Completado)
**Objetivo:** Transformar la app local en una plataforma global escalable.
* [x] **Migración a PostgreSQL:** Cambio de proveedor de base de datos para reducir costos y mejorar performance en la nube.
* [x] **Seguridad:** Implementación de `DotNetEnv` para proteger credenciales de BD.
* [x] **Cerebro de Ubicación (Frontend):** Creación de `state.js` (Observer Pattern) para gestionar la ubicación del usuario de forma centralizada.
* [x] **Lógica Geoespacial (Backend):** Implementación de `GeoService` (Fórmula Haversine) y refactorización de TODOS los Controllers (`Animales`, `Veterinarias`, `Foro`, `Match`) para filtrar data por radio (km).
* [x] **Pruebas de Estrés:** Verificación de comportamiento cambiando sensores de ubicación (Ej: Bs As vs Pringles).

---

### 📅 Sprint E: Profesionalización del Ecosistema (Completado)
**Objetivo:** Crear un modelo de negocio B2B sólido para veterinarios y clínicas.
* [x] **Refactorización de Modelos:** Separación de la entidad `PerfilVeterinario` (Persona) de la entidad `Clinica` (Lugar Físico).
* [x] **Sistema de Horarios:** Creación de tabla `HorarioClinica` para soportar turnos cortados y múltiples días.
* [x] **Wizard de Alta:** Desarrollo de `clinica-wizard.html` y su lógica JS para facilitar la carga de consultorios.
* [x] **Gestión de Aprobaciones:** Traspaso de la responsabilidad de aprobación de profesionales del Municipio al SuperAdmin (Dev).
* [x] **Panel "Mis Clínicas":** Dashboard para que el veterinario gestione sus sucursales y active turnos.

---

### 📅 Sprint F: Marketplace y Servicios (Completado)
**Estado:** ✅ Finalizado 
**Objetivo:** Expansión del ecosistema hacia comercios y servicios, estableciendo la base técnica para la monetización.

* [x] **Arquitectura de Datos (Backend):**
    * Implementación de entidades `Comercio` y `ItemCatalogo` (Code First) con relaciones de integridad referencial.
    * Inclusión de campos estratégicos (`NivelPlan`, `EsDestacado`) para futura escalabilidad comercial (Monetización/Ads).
    * Migración de base de datos (`AgregarMarketplace`).
* [x] **API y Lógica de Negocio:**
    * Desarrollo de `ComerciosController` con endpoints para CRUD completo y gestión de sub-recursos (Productos).
    * Implementación de búsqueda georreferenciada con filtros por categoría (`Rubro`) en el servidor.
    * Endpoint de borrado con validación de seguridad (Owner Check) y eliminación en cascada de catálogos.
* [x] **Frontend Público (La Vidriera):**
    * Desarrollo de `tiendas.html`: Interfaz dual (Mapa + Lista) con filtrado en tiempo real por etiquetas (PetShop, Farmacia, etc.).
    * **UX "Mini-Tienda":** Implementación de modal flotante (`z-index: 9999`) para visualizar el catálogo de productos sin abandonar el mapa, mejorando la retención del usuario.
    * **Conversión:** Botones de acción "Pedir por WhatsApp" dinámicos en cada producto.
* [x] **Gestión Comercial (Perfil):**
    * **Wizard de Alta:** Formulario de 3 pasos (`comercio-wizard.html`) con selector de ubicación en mapa y multiselección de rubros visual.
    * **Panel de Administración:** Integración en `perfil.html` de la sección "Mis Comercios".
    * **Gestor de Catálogo:** Modal administrativo para carga rápida de productos (Foto, Precio, Descripción) y eliminación de ítems en tiempo real.

### 📅 Sprint G: Ecosistema de Organizaciones y Tránsitos (Completado)
**Estado:** ✅ Finalizado 
**Objetivo:** Crear un sistema integral para conectar Organizaciones de Rescate con Hogares de Tránsito voluntarios, garantizando privacidad y eficiencia operativa.

* [x] **Arquitectura de Entidades (Backend):**
    * Creación de `PerfilOrganizacion` y `MiembroOrganizacion` para gestión multi-usuario de ONGs.
    * Creación de `HogarTransitorio` con atributos específicos (patio, niños, disponibilidad).
    * Migración de base de datos (`AgregarOrganizacionesYHogares`).
* [x] **Gestión de Organizaciones:**
    * Wizard de registro para ONGs (`ong-wizard.html`).
    * Módulo de aprobación en Panel SuperAdmin (Validación municipal).
    * Bloqueo de funciones avanzadas hasta obtener verificación "Aprobado".
* [x] **Red de Hogares de Tránsito:**
    * Wizard de postulación para ciudadanos (`hogar-wizard.html`) con geolocalización privada.
    * Lógica de higiene de datos: Filtro automático de hogares inactivos (>30 días) y endpoint de renovación.
* [x] **Panel de Operaciones (ONG):**
    * Desarrollo de `panel-ong.html` exclusivo para organizaciones verificadas.
    * **Buscador Inteligente:** Endpoint `GET /api/Hogares/buscar` con filtros combinados (Geo + Requisitos + Excluyentes).
    * Visualización en mapa con protección de datos (solo visible para ONGs).
* [x] **UX/UI y Estados:**
    * Lógica reactiva en `perfil.html` para mostrar estados (Pendiente/Aprobado/Vencido).
    * Corrección de estilos en filtros y tarjetas interactivas.
* [x] **Gestión Avanzada de Hogares (CRUD Completo):**
    * Implementación de endpoints `PUT /api/Hogares/{id}` (Edición) y `DELETE /api/Hogares/{id}` (Baja).
    * Adaptación del Frontend (`hogar-wizard.js`) para detectar modo "Edición", precargar datos existentes y actualizar en lugar de crear.
    * Botones de acción rápida en el perfil (Editar/Eliminar).
* [x] **Ciclo de Vida y Reactivación de Publicaciones:**
    * Implementación de lógica de "Semáforo" en el perfil según antigüedad de la actualización:
        * **Activo (Verde):** 0 a 24 días.
        * **Por Vencer (Amarillo):** 25 a 30 días (Habilita botón "Renovar").
        * **Pausado/Vencido (Rojo):** >30 días (Habilita botón "Reactivar" y oculta del mapa público).
    * Endpoint `PUT /api/Hogares/renovar/{id}` para resetear el contador de días sin perder la información del hogar.

* [x] **Refactorización del Módulo de Salud (Veterinarias):**
    * **Segregación de Interfaces (Frontend):** * Creación de `veterinarias.html` para desacoplar la búsqueda de profesionales del mapa de "Perdidos y Encontrados".
        * Implementación de un **Widget de Urgencia** dedicado y listado ordenado por geolocalización (distancia).
    * **Lógica de Negocio de Turnos (Backend):**
        * Modificación del modelo `Clinica` (Code First) agregando `FechaInicioTurno` para control temporal.
        * Implementación de patrón **Lazy Cleanup**: El endpoint `GET /api/Veterinarias` ahora audita automáticamente la antigüedad del turno. Si excede las 24hs, se desactiva y se persiste el cambio, garantizando higiene de datos sin necesidad de tareas programadas (Cron jobs).
    * **Mejoras en UX para Profesionales:**
        * Actualización de `perfil.html`: Visualización del estado del turno con **feedback de tiempo restante** (Cálculo de horas hasta vencimiento).
        * Inclusión de alertas educativas (SweetAlert2) sobre la regla de caducidad de 24hs al activar la guardia.
