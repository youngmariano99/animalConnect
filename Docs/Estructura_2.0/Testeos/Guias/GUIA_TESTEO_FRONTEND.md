# Guía de Testeo Automatizado - AnimalConnect Frontend

Esta guía detalla la infraestructura de pruebas automatizadas (E2E) implemenatada para el frontend de AnimalConnect utilizando **Playwright**.

## 1. Estructura de Carpetas

Hemos organizado las pruebas en `animal-connect-frontend/tests/e2e` para mantener el proyecto ordenado:

```
animal-connect-frontend/tests/e2e/
├── flows/          # Pruebas de Flujos Completos (User Journeys)
│   └── report-pet.spec.ts  # Wizard de Reportar Mascota
├── components/     # Pruebas de funcionalidades específicas
│   └── health-book.spec.ts # Libreta Sanitaria (Agregar Vacunas)
└── ui/             # Pruebas de Interfaz y Diseño
    └── ui-validation.spec.ts # Validación de Estilos (Botones, Colores)
```

**Nota:** Los reportes y videos de fallos se guardan en carpetas ignoradas por git (`test-results/`, `playwright-report/`) para no saturar el repositorio.

## 2. Requisitos Previos

Asegúrate de tener instalado Node.js. Si es la primera vez que ejecutas los tests, instala las dependencias:

```bash
cd animal-connect-frontend
npm install
npx playwright install --with-deps
```

## 3. Cómo Ejecutar las Pruebas

### Ejecutar todos los tests (Modo Headless)
Este comando corre todas las pruebas en segundo plano y muestra el resultado en la consola.
```bash
npx playwright test
```

### Ejecutar con Interfaz Gráfica (Recomendado)
Para ver cómo el navegador interactúa con la página paso a paso:
```bash
npx playwright test --ui
```

### Ejecutar un archivo específico
```bash
npx playwright test tests/e2e/flows/report-pet.spec.ts
```

## 4. Resumen de Pruebas Implementadas

### ✅ Reporte de Mascota Perdida (`flows/report-pet.spec.ts`)
**Objetivo:** Verificar que un usuario puede completar todo el wizard de reporte.
- **Pasos:** Login (Simulado) -> Click en FAB (+) -> "Perdí mi Mascota" -> Carga de Foto -> Detalles -> Selección en Mapa -> Publicar.
- **Validación:** Se intercepta la petición a la API (`POST /api/Animales`) para confirmar que los datos se envían correctamente.

### ✅ Libreta Sanitaria Digital (`components/health-book.spec.ts`)
**Objetivo:** Verificar la gestión del perfil de salud de una mascota.
- **Pasos:** Navegar a "Mis Mascotas" -> Seleccionar Mascota -> Ir al Tab de Salud -> Agregar Vacuna -> Llenar Formulario -> Guardar.
- **Validación:** Se simula la respuesta de la API y se verifica que la nueva vacuna aparezca en el listado visualmente.

### ✅ Validación UI (`ui/ui-validation.spec.ts`)
**Objetivo:** Asegurar estándares de calidad visual y accesibilidad móvil.
- **Pasos:** Navegar al Login.
- **Validación:**
    - Botón primario ("Ingresar") debe tener **altura >= 48px** (Estándar ergonómico táctil).
    - Color del botón debe coincidir con la identidad de marca (**Bio-Teal**).

## 5. Solución de Problemas Comunes

- **Error: `connect ECONNREFUSED`**: Asegúrate de que el frontend (`npm run dev`) y el backend (`dotnet run`) estén corriendo. Playwright intenta levantar el front, pero necesita el backend para ciertas llamadas reales (aunque muchas están mockeadas, el login real o la carga inicial pueden requerirlo).
- **Timeouts**: Si tu PC es lenta, puedes aumentar el timeout en `playwright.config.ts` o correr con `--headed` para ver dónde se traba.
- **Selectores no encontrados**: Si cambias textos en la UI (ej: de "Ingresar" a "Entrar"), los tests fallarán. Debes actualizar los archivos `.spec.ts` correspondientes.

---
**Generado por Antigravity - 12/02/2026**
