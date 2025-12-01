using AnimalConnect.Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CONFIGURACIÓN DE SERVICIOS (Antes del Build) ---

// Add services to the container.
builder.Services.AddOpenApi();

// A. Configurar la conexión a SQL Server
// Leemos la cadena de conexión del archivo appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// B. Inyectamos el DbContext en el contenedor de servicios
// IMPORTANTE: Esto debe ir ANTES de builder.Build()
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// --- FIN CONFIGURACIÓN SERVICIOS ---

var app = builder.Build();

// --- 2. CONFIGURACIÓN DEL PIPELINE HTTP (Después del Build) ---

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Agregamos Swagger UI para ver la documentación visualmente (opcional pero recomendado)
    // app.UseSwaggerUI(); 
}

app.UseHttpsRedirection();

// --- EJEMPLO CLIMA (Esto lo borraremos después, pero déjalo por ahora para probar) ---
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