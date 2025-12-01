using AnimalConnect.Backend.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CONFIGURACIÓN DE SERVICIOS (Antes del Build) ---

// Add services to the container.
builder.Services.AddOpenApi();

// A. Configurar la conexión a SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// B. ACTIVAR LOS CONTROLADORES
// Esta línea le dice a .NET: "Busca clases en la carpeta Controllers"
builder.Services.AddControllers(); // <--- ¡IMPORTANTE! SIN ESTO NO VE TU CONTROLLER

// --- FIN CONFIGURACIÓN SERVICIOS ---

var app = builder.Build();

// --- 2. CONFIGURACIÓN DEL PIPELINE HTTP (Después del Build) ---

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); 
}

app.UseHttpsRedirection();

// --- NUEVO: PERMITIR ARCHIVOS ESTÁTICOS (FOTOS) ---
app.UseStaticFiles();

// C. MAPEAR LOS CONTROLADORES
// Esta línea habilita las rutas que definiste (como api/Animales)
app.MapControllers(); // <--- ¡IMPORTANTE!


// --- EJEMPLO CLIMA (Esto lo puedes borrar si quieres, ya no es necesario) ---
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}