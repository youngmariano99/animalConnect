using AnimalConnect.Backend.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);


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

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

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