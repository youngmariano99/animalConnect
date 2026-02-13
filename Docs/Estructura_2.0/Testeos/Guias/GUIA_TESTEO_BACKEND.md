# Guía de Testeo Automatizado - AnimalConnect Backend

Esta guía detalla cómo probar la lógica de negocio y la integración con la base de datos del backend de AnimalConnect.

## 1. Requisitos Previos

Para ejecutar estas pruebas, **ES OBLIGATORIO** tener instalado y corriendo:

1.  **Docker Desktop**: Las pruebas utilizan `Testcontainers` para crear una base de datos PostgreSQL real y aislada por cada ejecución.
    *   [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/)
    *   Asegúrate de que el comando `docker ps` funcione en tu terminal.

2.  **.NET 9 SDK**: El entorno de desarrollo actual.

## 2. Estructura del Proyecto de Pruebas

Las pruebas se encuentran en `Tests/AnimalConnect.Backend.Tests/`:

```
Tests/AnimalConnect.Backend.Tests/
├── Integration/
│   └── Controllers/
│       └── MatchControllerTests.cs  # Prueba del algoritmo de Match
├── Utilities/
│   └── DataSeeder.cs  # Generador de datos falsos (Usuarios, Animales)
├── IntegrationTestWebAppFactory.cs  # Configura el servidor de prueba y la BD Docker
└── BaseIntegrationTest.cs           # Clase base para compartir contexto
```

## 3. Código Probado y Resultados

### ✅ MatchController (Algoritmo de Emparejamiento)
Hemos implementado y (teóricamente) validado la siguiente lógica crítica:

*   **Filtro Duro (Hard Filter)**:
    *   **Escenario**: Un adoptante que vive en **Departamento** busca mascota.
    *   **Regla**: Los perros con **Nivel de Energía > 7** (8, 9, 10) son **excluidos automáticamente**, sin importar qué tan compatibles sean en otros aspectos.
    *   **Código**: `if (Departamento && Energia > 7) continue;`
    *   **Resultado Esperado del Test**: La lista de matches devuelta NO debe contener al perro "Flash" (Energía 10), pero SÍ a "Snoopy" (Energía 3).

## 4. Cómo Ejecutar las Pruebas

Abre una terminal en la carpeta del proyecto de tests:

```bash
cd Tests/AnimalConnect.Backend.Tests
```

Ejecuta el comando:

```bash
dotnet test
```

### Interpretación de Resultados

*   **✅ Passed (Verde)**: La lógica funciona correctamente. El filtro duro está activo y la base de datos se conectó bien.
*   **❌ Failed (Rojo) con error `DockerUnavailableException`**: Significa que **Docker no está corriendo**. Inicia Docker Desktop y vuelve a intentar.
*   **❌ Failed (Rojo) en `MatchControllerTests`**:
    *   Si dice `Expected collection not to contain item... found <Flash>`, significa que el filtro NO está funcionando (el perro prohibido se coló en la lista).

---
**Nota Importante**: En el entorno actual, no pudimos ejecutar la validación final del runtime porque Docker no estaba disponible. Sin embargo, el código ha sido corregido estáticamente para asegurar que el filtro duro "Energía vs Departamento" esté implementado.
