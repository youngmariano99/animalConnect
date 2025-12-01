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

## 3. Configuración del Proyecto ("El Cableado")

Para que la aplicación sepa cómo conectarse a la Base de Datos y utilizar Entity Framework, es necesario modificar dos archivos clave.

### A. `appsettings.json` (Cadena de Conexión)
En este archivo se define la ruta al servidor SQL y las credenciales.

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=AnimalConnectDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
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

Error 1: dotnet-ef no encontrado o configuración corrupta
Síntoma: Mensaje "El archivo de configuración DotnetToolSettings.xml no se encontró" al intentar instalar la herramienta.

Causa: La caché de NuGet estaba corrupta o hubo una instalación global previa fallida.

Solución:

Limpiar la caché de NuGet: dotnet nuget locals all --clear

Instalar la herramienta de forma local usando un manifiesto: dotnet new tool-manifest seguido de dotnet tool install dotnet-ef.

Error 2: The type or namespace name 'DbContext' could not be found
Síntoma: El archivo ApplicationDbContext.cs mostraba múltiples errores de compilación (líneas rojas).

Causa: Faltaban instalar los paquetes NuGet de Entity Framework en el proyecto, a pesar de tener la herramienta de consola instalada.

Solución: Ejecutar los comandos dotnet add package Microsoft.EntityFrameworkCore... para las librerías Core y SqlServer.

Error 3: Incompatibilidad de Versiones (NU1202)
Síntoma: "Package Microsoft.EntityFrameworkCore 10.0.0 is not compatible with net9.0".

Causa: Al no especificar versión, NuGet intentó instalar la versión 10 (Preview) en un proyecto .NET 9.

Solución: Forzar la instalación de la versión compatible agregando el flag de versión: dotnet add package ... --version 9.0.0.

Error 4: Fallo en Tiempo de Ejecución (Program.cs)
Síntoma: La aplicación compilaba correctamente, pero fallaba al iniciar o al intentar acceder a la BD.

Causa: Se intentó inyectar el servicio AddDbContext después de haber ejecutado builder.Build().

Solución: Mover la lógica de configuración hacia arriba, dentro de la sección de "Configuración de Servicios".