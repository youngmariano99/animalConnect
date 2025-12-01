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