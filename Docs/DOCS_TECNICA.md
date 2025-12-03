# 📘 Guía de Configuración: Entity Framework Core (Code First)

> **Resumen:** Pasos realizados para configurar el acceso a datos en un proyecto .NET 9 utilizando SQL Server y el enfoque "Code First" (primero el código, luego la base de datos).

---

## 1. Instalación de Herramientas de Comandos (CLI)

Para ejecutar comandos como `dotnet ef`, necesitamos instalar la herramienta.

**El Problema:** Al intentar instalarla globalmente (`--global`), hubo conflictos con versiones anteriores o caché corrupta en el sistema.
**La Solución (Best Practice):** Instalar la herramienta de forma **local** (solo para este proyecto). Esto garantiza que todos los desarrolladores del equipo usen la misma versión.

### Pasos:
1.  **Crear el manifiesto:**
    ```powershell
    dotnet new tool-manifest
    ```
2.  **Instalar la herramienta (Local):**
    ```powershell
    dotnet tool install dotnet-ef
    ```

---

## 2. Instalación de Librerías (Paquetes NuGet)

El proyecto necesita 3 paquetes fundamentales para funcionar.

**⚠️ Error Crítico Detectado (NU1202):**
Al instalar los paquetes sin especificar versión, NuGet intentó descargar la versión `10.0.0` (Preview/Alpha). Como el proyecto es `.NET 9`, esto generó un error de incompatibilidad.

**Solución:** Forzar la instalación de la versión `9.0.0` compatible con el proyecto.

### Comandos Ejecutados:
```powershell
# 1. El Core del ORM
dotnet add package Microsoft.EntityFrameworkCore --version 9.0.0

# 2. El proveedor para SQL Server
dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 9.0.0

# 3. Herramientas para consola (necesario para migrations)
dotnet add package Microsoft.EntityFrameworkCore.Tools --version 9.0.0

## 3. Configuración del Proyecto ("El Cableado")

Para que la aplicación sepa cómo conectarse a la Base de Datos y utilizar Entity Framework, es necesario modificar dos archivos clave.

### A. `appsettings.json` (Cadena de Conexión)
En este archivo se define la ruta al servidor SQL y las credenciales.

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=AnimalConnectDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```
## 3. Configuración del Proyecto ("El Cableado")

Para que la aplicación sepa cómo conectarse a la Base de Datos y utilizar Entity Framework, es necesario modificar dos archivos clave.

### A. `appsettings.json` (Cadena de Conexión)
En este archivo se define la ruta al servidor SQL y las credenciales.

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=AnimalConnectDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```
Desglose de la cadena:

Server=.: Indica el servidor local (Localhost). Si se usa SQL Express, puede ser .\\SQLExpress.

Database=AnimalConnectDB: El nombre que tendrá la base de datos en SQL Server.

Trusted_Connection=True: Utiliza la autenticación de Windows (sin usuario/contraseña explícitos).

TrustServerCertificate=True: Necesario para desarrollo local para evitar errores de certificados SSL.

B. Program.cs (Inyección de Dependencias)
Aquí registramos el DbContext en el contenedor de servicios de .NET.

⚠️ Regla de Oro: La configuración de la base de datos debe realizarse ANTES de la línea var app = builder.Build();.

C#

using AnimalConnect.Backend.Data;
using Microsoft.EntityFrameworkCore;

// ...

// 1. Obtener la cadena desde appsettings
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Inyectar el DbContext (ANTES del Build)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// ...

var app = builder.Build(); // <-- Punto de no retorno para configuración de servicios
### 4. Flujo de Migraciones (Migrations)
El proceso estándar para llevar los cambios de nuestras clases C# (Modelos) a la base de datos SQL Server.

1. Crear la Migración: Genera un archivo de código con las instrucciones SQL necesarias (basado en los cambios detectados).

PowerShell

dotnet ef migrations add NombreDelCambio
2. Actualizar la Base de Datos: Ejecuta esas instrucciones en el servidor real para crear o modificar tablas.

PowerShell

dotnet ef database update
🛑 Registro de Errores y Soluciones (Troubleshooting)
Esta sección documenta los obstáculos técnicos encontrados durante la configuración inicial y cómo fueron resueltos.

### Error 1: dotnet-ef no encontrado o configuración corrupta
Síntoma: Mensaje "El archivo de configuración DotnetToolSettings.xml no se encontró" al intentar instalar la herramienta.

Causa: La caché de NuGet estaba corrupta o hubo una instalación global previa fallida.

Solución:

Limpiar la caché de NuGet: dotnet nuget locals all --clear

Instalar la herramienta de forma local usando un manifiesto: dotnet new tool-manifest seguido de dotnet tool install dotnet-ef.

### Error 2: The type or namespace name 'DbContext' could not be found
Síntoma: El archivo ApplicationDbContext.cs mostraba múltiples errores de compilación (líneas rojas).

Causa: Faltaban instalar los paquetes NuGet de Entity Framework en el proyecto, a pesar de tener la herramienta de consola instalada.

Solución: Ejecutar los comandos dotnet add package Microsoft.EntityFrameworkCore... para las librerías Core y SqlServer.

### Error 3: Incompatibilidad de Versiones (NU1202)
Síntoma: "Package Microsoft.EntityFrameworkCore 10.0.0 is not compatible with net9.0".

Causa: Al no especificar versión, NuGet intentó instalar la versión 10 (Preview) en un proyecto .NET 9.

Solución: Forzar la instalación de la versión compatible agregando el flag de versión: dotnet add package ... --version 9.0.0.

### Error 4: Fallo en Tiempo de Ejecución (Program.cs)
Síntoma: La aplicación compilaba correctamente, pero fallaba al iniciar o al intentar acceder a la BD.

Causa: Se intentó inyectar el servicio AddDbContext después de haber ejecutado builder.Build().

Solución: Mover la lógica de configuración hacia arriba, dentro de la sección de "Configuración de Servicios".

## 5. Manejo de Archivos y Multimedia

El sistema no almacena las imágenes como BLOBs (binarios) dentro de SQL Server para evitar degradación de rendimiento. Se utiliza una estrategia de **Referencias URL**.

### Arquitectura de Archivos
* **Almacenamiento Físico:** Carpeta `/wwwroot/uploads` en la raíz del servidor.
* **Base de Datos:** La tabla `Animales` tiene un campo `ImagenUrl` (VARCHAR) que guarda la dirección web del archivo.

### Controlador de Archivos (`ArchivosController`)
Este controlador auxiliar maneja la entrada/salida de ficheros (`IFormFile`).
* **Seguridad:** Genera nombres aleatorios usando `Guid.NewGuid()` para prevenir que un usuario sobrescriba la foto de otro si suben archivos con el mismo nombre (ej: "foto.jpg").
* **Respuesta:** Retorna un objeto JSON con la URL absoluta para ser consumida inmediatamente por el Frontend.

## 6. Geolocalización y Mapas

Para la representación espacial de los datos se utiliza una arquitectura de renderizado en cliente (Client-Side Rendering).

### Componentes
* **Librería:** Leaflet.js (Ligera, Open Source, Mobile Friendly).
* **Proveedor de Mapas (Tiles):** OpenStreetMap (OSM).
* **Manejo de Coordenadas:**
    - Backend: Almacena `Latitud` y `Longitud` como `double` en SQL Server.
    - Frontend: Recibe estos valores en el JSON y los instancia como objetos `L.marker([lat, lon])`.

### Lógica de Sincronización
Para mantener la coherencia entre la lista y el mapa:
1.  Existe un `LayerGroup` en Leaflet que agrupa todos los marcadores.
2.  Cada vez que se aplica un filtro (ej: buscar "Perro"), se ejecuta `markersGroup.clearLayers()` para limpiar el mapa.
3.  Se regeneran solo los marcadores que coinciden con la búsqueda actual.

### 7. Estrategia de Higiene de Datos (TTL)
Para evitar la saturación visual del mapa y mantener la relevancia de los reportes, se implementó una regla de filtrado temporal en el Backend.
- **Problemática:** La acumulación de reportes antiguos (animales ya encontrados o publicaciones abandonadas) degrada la experiencia de usuario.
- **Solución:** El endpoint `GET /api/Animales` aplica un filtro `Where(x => x.FechaPublicacion >= DateTime.Now.AddDays(-15))`.
- **Resultado:** Las publicaciones tienen una vigencia efectiva de 2 semanas en la vista pública, manteniéndose en la base de datos para fines estadísticos históricos.

## 8. Flujo de Creación de Datos (Frontend -> Backend)

La creación de un nuevo reporte implica una transacción en dos pasos coordinada por el cliente:

1.  **Carga de Multimedia (Media Upload):**
    - El cliente envía la imagen mediante `multipart/form-data`.
    - El servidor almacena el archivo y retorna `{ url: "..." }`.
    
2.  **Persistencia de Entidad:**
    - El cliente construye el objeto DTO (Data Transfer Object) con los datos del formulario, las coordenadas capturadas del mapa y la URL de la imagen.
    - Se envía un `POST /api/Animales` con `Content-Type: application/json`.
    - **Optimización:** El Backend responde con `200 OK` y el objeto creado, evitando el uso de `CreatedAtAction` para prevenir errores de enrutamiento en desarrollo local.

## 9. Arquitectura del Dashboard Administrativo

El panel de administración utiliza una estrategia de **Single Page Application (SPA)** simplificada para el consumo de métricas.

### Componentes de Visualización
1.  **Mapa de Calor (Heatmap):**
    - Utiliza un array de vectores `[lat, lng, intensidad]`.
    - La intensidad se normaliza a `0.8` para resaltar visualmente las zonas con múltiples reportes superpuestos (hotspots).
    
2.  **Gestión de Ciclo de Vida del DOM:**
    - Debido a la naturaleza dinámica de las librerías de gráficos (Chart.js y Leaflet), se implementó un control de instancias globales (`let mapaCalor`, `let grafico`).
    - Antes de cada renderizado (ej: tras eliminar un registro), se verifica si la instancia existe y se invoca su método destructor para liberar memoria y evitar conflictos en el canvas HTML.

### Endpoint de Eliminación
- **Método:** `DELETE /api/Animales/{id}`.
- **Comportamiento:** Eliminación física del registro en SQL Server.
- **Respuesta:** `204 No Content` (Estándar REST para borrados exitosos).

## 10. Arquitectura del Sistema de Match (Escalabilidad)

Para cumplir con el requisito de "Adopción Inteligente" y garantizar la escalabilidad futura, se evitó el uso de columnas fijas en la tabla `Animales`. Se optó por un modelo relacional dinámico.

### Modelo de Datos (Dinámico)
* **`Atributo`:** Define la característica (ej: "Nivel de Energía", "Requiere Patio").
* **`AnimalAtributo`:** El valor real que tiene cada animal.
* **`PreferenciaAdoptante`:** Lo que el usuario busca + un factor de **Importancia** (Ponderación 1-5).

### Algoritmo de Puntuación (Weighted Scoring)
El controlador `MatchController` ejecuta la siguiente lógica por cada animal activo:

1.  **Carga:** Recupera el perfil del usuario y sus preferencias con `Include()`.
2.  **Iteración:** Recorre cada preferencia del usuario y busca si el animal tiene ese atributo medido.
3.  **Cálculo de Delta:** Calcula la diferencia absoluta (`Math.Abs`) entre el valor buscado y el real.
    * *Diferencia 0 (Exacto):* Suma el puntaje completo de importancia.
    * *Diferencia 1 (Aproximado):* Suma el 50% del puntaje (Penalización suave).
    * *Diferencia > 1:* No suma puntos (Penalización fuerte).
4.  **Normalización:** El puntaje final se convierte a porcentaje sobre el máximo posible teórico.

## 11. Manejo de Serialización JSON

Debido a la alta interconexión de las entidades (Usuario <-> Perfil <-> Preferencias <-> Atributo), se detectaron excepciones de tipo `JsonException: A possible object cycle was detected`.

**Solución Implementada:**
Se configuró el serializador `System.Text.Json` en el `Program.cs` para ignorar ciclos de referencias automáticamente:

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
```

## 12. Arquitectura del Módulo de Campañas (Salud)

Sistema para la gestión de eventos itinerantes (Castración/Vacunación).

### Modelo de Datos
* **Entidad:** `Campania` (Título, Descripción, FechaHora, Lat/Lon).
* **Persistencia:** Tabla independiente en SQL Server.
* **Truco de Optimización (MVP):** Para evitar migraciones complejas en la etapa final, se utilizó el campo `Descripcion` para almacenar metadatos adicionales (Hora Fin y Teléfono) con un formato de texto estructurado (ej: `"Texto... | Fin: 12:00 | Tel: 1234"`), que el Frontend parsea al renderizar.

## 13. Estrategia de Frontend (Vanilla SPA)

A pesar de no utilizar un Framework SPA (Single Page Application) como React, se emuló su comportamiento para una experiencia fluida.

* **Gestión de Vistas:** Se utiliza un patrón de **"Tabs"** donde todo el HTML existe en el DOM inicial pero oculto (`display: none`).
* **Funciones de Enrutamiento:**
    - `cambiarSeccion(id)` en Público.
    - `cambiarVista(id)` en Admin.
    - Estas funciones orquestan la visibilidad de los contenedores y, crucialmente, **inicializan los mapas de Leaflet** solo cuando la pestaña se hace visible para evitar errores de renderizado de canvas (`invalidateSize`).

## 14. Arquitectura del Módulo de Identidad y Roles (Sprint A)

Para soportar múltiples tipos de usuarios sin romper la base de datos existente, se implementó una estrategia de **Composición de Perfiles**.

### Modelo de Datos (Extensión)
En lugar de usar Herencia (Table-Per-Hierarchy), se optó por relaciones 1 a 1 opcionales:
* **Entidad `Usuario`:** Mantiene las credenciales (User/Pass/Rol).
* **Entidad `PerfilVeterinario`:** Contiene datos de negocio (Matrícula, Logo, Horarios) y de estado (`EstadoVerificacion`, `EsDeTurno`).
* **Ventaja:** Permite que un usuario evolucione o tenga múltiples roles en el futuro sin migraciones destructivas.

### Flujo de Registro Geo-Referenciado
A diferencia del reporte de mascotas (que usa el GPS del navegador), el registro de veterinarios requiere precisión comercial.
1.  **Frontend:** Se instancia un mapa Leaflet dentro del formulario de registro.
2.  **Captura:** Al hacer click, se extrae `e.latlng` y se guarda en variables temporales.
3.  **Persistencia:** Se envían junto al DTO de registro. Si el rol es "Veterinario", el Backend valida que las coordenadas no sean nulas (`0,0`).

### Lógica de "Farmacia de Turno" (Single Active)
Para gestionar quién está de guardia, se creó una lógica de exclusividad en el controlador `VeterinariasController`.
* **Endpoint:** `PUT /api/Veterinarias/turno/{id}`.
* **Algoritmo:**
    1.  Recibe el ID del veterinario a activar.
    2.  Itera sobre *todos* los veterinarios y establece `EsDeTurno = false`.
    3.  Establece `EsDeTurno = true` solo al seleccionado.
    4.  Si se selecciona al que ya está activo, se apaga (quedando 0 activos).
* **Resultado:** Garantiza que nunca haya dos veterinarias de turno simultáneamente, simplificando la vista para el ciudadano.

### Seguridad de Acceso
Se modificó el `AuthController` para realizar una validación en dos pasos:
1.  **Credenciales:** Verifica Usuario y Contraseña.
2.  **Estado (Solo Vets):** Si el rol es Veterinario, consulta `EstadoVerificacion`.
    * *Pendiente:* Retorna error 403 o mensaje de advertencia "En espera de aprobación".
    * *Rechazado:* Bloquea el acceso.
    * *Aprobado:* Permite el ingreso y emisión de token (o sesión local).