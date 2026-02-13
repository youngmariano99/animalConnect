import { test, expect } from '@playwright/test';

test.describe('Profile Services Management', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Geolocation
        await page.context().grantPermissions(['geolocation']);
        await page.context().setGeolocation({ latitude: -38.7167, longitude: -62.2833 });
    });

    test('Transit Home: Should register correctly', async ({ page }) => {
        // Mock User
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ id: 200, rol: 'Ciudadano' }));
        });

        // Mock POST
        await page.route('**/api/Hogares', async route => {
            await route.fulfill({ status: 200 });
        });

        await page.goto('http://localhost:5173/transit-register');

        // Step 1: Form
        await page.fill('input[type="tel"]', '11223344');
        await page.fill('input[placeholder="Calle y Número"]', 'Calle Falsa 123');
        await page.click('button:has-text("Continuar")');

        // Step 2: Map
        await page.locator('.leaflet-container').click();
        await page.click('button:has-text("Continuar")');

        // Step 3: Confirm
        await page.click('button:has-text("Enviar Solicitud")');

        // Expect redirect
        await expect(page).toHaveURL(/.*\/perfil/);
    });

    test('Commerce: Should create new business', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ id: 200, rol: 'Ciudadano' }));
        });

        await page.route('**/api/Comercios', async route => { await route.fulfill({ status: 200 }) });

        await page.goto('http://localhost:5173/comercio-register');

        // Step 1: Data
        await page.fill('input[placeholder*="PetShop"]', 'Mi Negocio');
        await page.selectOption('select', 'PetShop');
        await page.fill('input[placeholder="Calle y Altura"]', 'Av. Siempre Viva 742');
        await page.click('button:has-text("Continuar")');

        // Step 2: Map
        await page.locator('.leaflet-container').click();
        await page.click('button:has-text("Continuar")');

        // Step 3: Confirm
        await page.click('button:has-text("Crear Comercio")');

        await expect(page).toHaveURL(/.*\/perfil/);
    });

    test('Clinic: Should valid vet user and create clinic', async ({ page }) => {
        // Mock Vet User
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ id: 300, rol: 'Veterinario' }));
        });

        await page.route('**/api/Clinicas', async route => { await route.fulfill({ status: 200 }) });

        await page.goto('http://localhost:5173/clinica-wizard');

        // Step 1: Data
        await page.fill('input[placeholder*="Veterinaria"]', 'Vet Life');
        await page.fill('input[placeholder*="2923"]', '291443322');
        await page.fill('input[placeholder="Calle y Número"]', 'San Martin 500');
        await page.click('button:has-text("Continuar")');

        // Step 2: Map
        await page.locator('.leaflet-container').click();
        await page.click('button:has-text("Continuar")');

        // Step 3: Hours (Defaults are fine)
        await page.click('button:has-text("Confirmar Alta")');

        await expect(page).toHaveURL(/.*\/perfil/);
    });

});
