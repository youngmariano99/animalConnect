import { test, expect } from '@playwright/test';

test.describe('Home Features & Map', () => {

  test.beforeEach(async ({ page }) => {
    // Mock user location to Bahia Blanca
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: -38.7167, longitude: -62.2833 });

    // Mock Backend Response for Animals
    await page.route('**/api/Animales*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 101,
            nombre: 'Bobby',
            descripcion: 'Perro perdido',
            imagenUrl: '',
            idEstado: 1, // Perdido
            idEspecie: 1, // Perro
            ubicacionLat: -38.7160,
            ubicacionLon: -62.2830,
            fechaPublicacion: new Date().toISOString()
          },
          {
            id: 102,
            nombre: 'Mishi',
            descripcion: 'Gato encontrado',
            imagenUrl: '',
            idEstado: 2, // Encontrado
            idEspecie: 2, // Gato
            ubicacionLat: -38.7170,
            ubicacionLon: -62.2840,
            fechaPublicacion: new Date().toISOString()
          }
        ])
      });
    });

    await page.goto('http://localhost:5173/home');
  });

  test('Location: Should ask for permissions and update map', async ({ page }) => {
    // Switch to Map View first to see the location status
    await page.getByTestId('btn-view-map').click();

    // Expect "Buscando tu ubicación..." to NOT be present after geoloc resolving
    await expect(page.getByTestId('location-status-badge')).not.toBeVisible();

    // Check if map is centered (Leaflet canvas exists)
    await expect(page.getByTestId('map-view-container')).toBeVisible();
  });

  test('Filters: Should filter by Status and Species', async ({ page }) => {
    // Default: List View, All animals
    await expect(page.getByText('Bobby')).toBeVisible(); // Perdido
    await expect(page.getByText('Mishi')).toBeVisible(); // Encontrado

    // Filter: Perdidos Only
    await page.getByRole('button', { name: 'Perdidos' }).click();
    await expect(page.getByText('Bobby')).toBeVisible();
    await expect(page.getByText('Mishi')).not.toBeVisible();

    // Filter: Encontrados Only
    await page.getByRole('button', { name: 'Encontrados' }).click();
    await expect(page.getByText('Bobby')).not.toBeVisible();
    await expect(page.getByText('Mishi')).toBeVisible();

    // Reset to Todos
    await page.getByRole('button', { name: 'Todos' }).click();

    // Filter: Gatos Only
    await page.getByRole('button', { name: 'Gatos' }).click();
    await expect(page.getByText('Mishi')).toBeVisible();
    await expect(page.getByText('Bobby')).not.toBeVisible();
  });

  test('View Toggle: Should switch between Map and List', async ({ page }) => {
    // Default is List (Grid)
    await expect(page.locator('.grid')).toBeVisible();

    // Switch to Map
    await page.getByTestId('btn-view-map').click();

    // Expect Map Container to be visible
    await expect(page.getByTestId('map-view-container')).toBeVisible();
    // Grid should be hidden
    await expect(page.locator('.grid')).not.toBeVisible();

    // Switch back to List
    await page.getByTestId('btn-view-list').click();
    await expect(page.locator('.grid')).toBeVisible();
  });

  test('Report Found Pet: Should open wizard and submit', async ({ page }) => {
    // Mock Login User
    await page.evaluate(() => {
      localStorage.setItem('usuario', JSON.stringify({ id: 99, nombre: 'TestUser', rol: 'Ciudadano' }));
    });

    // Mock POST
    await page.route('**/api/Animales', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ id: 200 }) });
    });

    // Click "Encontré algo" (Quick Action)
    await page.locator('button').filter({ hasText: /Encontré/ }).click();

    // Step 1: Upload (Skip actual file, mock next)
    await page.setInputFiles('input[type="file"]', {
      name: 'cat.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock-image')
    });
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Step 2: Details
    await page.fill('input[placeholder*="Ej: Rocky"]', 'Gato Tricolor');
    await page.click('button:has-text("Gato")'); // Select Gato
    await page.fill('textarea', 'Encontrado cerca del parque');
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Step 3: Location (Click on map)
    await page.locator('.leaflet-container').click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Step 4: Contact
    await page.fill('input[type="tel"]', '12345678');
    await page.getByRole('button', { name: 'PUBLICAR AVISO' }).click();

    // Success
    await expect(page.getByText('¡Reporte Enviado!')).toBeVisible();
  });

});
