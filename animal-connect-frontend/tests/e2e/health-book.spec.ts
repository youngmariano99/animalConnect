import { test, expect } from '@playwright/test';

test.describe('Health Book', () => {
    test('should add a vaccine to the health record', async ({ page }) => {
        // 1. Login
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({
                id: 1,
                nombre: 'VetUser',
                rol: 'Ciudadano',
                tienePerfilMatch: true
            }));
        });

        await page.goto('/mis-mascotas');

        // 2. Select Pet
        // Mock Dashboard list - Correct Endpoint
        await page.route('**/api/Animales/usuario/1', async route => {
            const json = [{
                id: 101,
                nombre: 'Luna',
                especie: { nombre: 'Gato' },
                imagenUrl: 'https://via.placeholder.com/150'
            }];
            await route.fulfill({ json });
        });

        // Mock Pet Detail - Initial Check
        await page.route('**/api/Animales/101', async route => {
            const json = {
                id: 101,
                nombre: 'Luna',
                especie: { nombre: 'Gato' },
                vacunas: []
            };
            await route.fulfill({ json });
        });

        // Mock Vaccine Submission
        await page.route('**/api/Animales/101/vacunas', async route => {
            await route.fulfill({ status: 200, json: { id: 501, nombre: 'AntirrábicaTest', fechaAplicacion: '2023-10-10' } });
        });

        // Reload page to ensure mocks are active
        await page.reload();

        // Click on Pet Card
        await page.getByText('Luna').click();

        // 3. Verify Navigation to Pet Profile
        await expect(page).toHaveURL(/.*\/pet\/101/);

        // 4. Add Vaccine
        // Click "Agregar" button (Has Plus icon)
        await page.getByRole('button', { name: /Agregar/i }).click();

        // Fill Form
        // Placeholders: "Nombre (ej: Séxtuple, Anti-rábica)"
        await page.getByPlaceholder(/Nombre/i).fill('AntirrábicaTest');

        // Submit
        // Button: "Registrar en Libreta"
        // We need to update the mock for the *next* fetch of animal details to include the new vaccine, 
        // because the component re-fetches the animal on success.
        await page.route('**/api/Animales/101', async route => {
            const json = {
                id: 101,
                nombre: 'Luna',
                especie: { nombre: 'Gato' },
                // Include the new vaccine this time
                vacunas: [{ id: 501, nombre: 'AntirrábicaTest', fechaAplicacion: '2023-10-10', veterinario: 'Yo' }]
            };
            await route.fulfill({ json });
        });

        await page.getByRole('button', { name: /Registrar en Libreta/i }).click();

        // 5. Verify in List
        // It should appear
        await expect(page.getByText('AntirrábicaTest')).toBeVisible();
    });
});
