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