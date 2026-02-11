using AnimalConnect.Backend.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;
using DotNetEnv; // <--- 1. Importar librería
using System.Globalization; // <--- AGREGAR ESTO ARRIBA
using CloudinaryDotNet;

// 2. Cargar el archivo .env ANTES de crear el builder
Env.Load();

var builder = WebApplication.CreateBuilder(args);

var cultureInfo = new CultureInfo("en-US");
CultureInfo.DefaultThreadCurrentCulture = cultureInfo;
CultureInfo.DefaultThreadCurrentUICulture = cultureInfo;
// --- 1. CONFIGURACIÓN DE SERVICIOS ---

builder.Services.AddOpenApi();

// A. CORS: Permitir que cualquiera entre (Solo para Desarrollo)
builder.Services.AddCors(options => // <--- NUEVO: SERVICIO CORS
{
    options.AddPolicy("PermitirTodo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 3. Obtener la cadena de conexión desde las Variables de Entorno (del .env)
// Si no encuentra la variable de entorno, intenta buscar en appsettings.json como respaldo
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
                       ?? builder.Configuration.GetConnectionString("DefaultConnection");

// CAMBIO CRÍTICO: Configuración para Fechas (Ver explicación abajo en Paso 4)
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.UseNetTopologySuite()));

// 4. Configurar Cloudinary (Gestión de Imágenes)
// builder.Services.AddScoped<IPhotoService, PhotoService>(); // <-- Próximamente

var cloudName = Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
var apiKey = Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
var apiSecret = Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");

if (!string.IsNullOrEmpty(cloudName))
{
    var account = new Account(cloudName, apiKey, apiSecret);
    var cloudinary = new Cloudinary(account);
    builder.Services.AddSingleton(cloudinary);
}

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

// --- INICIO DATA SEEDING ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // Esta línea crea la BD si no existe y ejecuta el Seeder
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al sembrar la base de datos.");
    }
}
// --- FIN DATA SEEDING ---

// --- 2. CONFIGURACIÓN DEL PIPELINE ---

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// app.UseHttpsRedirection();

// B. ACTIVAR ARCHIVOS ESTÁTICOS (FOTOS)
app.UseStaticFiles();

// C. ACTIVAR CORS (IMPORTANTE: Antes de MapControllers y Auth)
app.UseCors("PermitirTodo"); // <--- NUEVO: ACTIVAR LA POLÍTICA

app.MapControllers();

app.Run();