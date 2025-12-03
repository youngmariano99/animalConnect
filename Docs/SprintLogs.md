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
**✅ CIERRE DE SPRINT 2:** Backend funcional con base de datos, relaciones y manejo de multimedia.

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