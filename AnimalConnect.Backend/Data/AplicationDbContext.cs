using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Animal> Animales { get; set; }
        public DbSet<Especie> Especies { get; set; }
        public DbSet<Estado> Estados { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Campania> Campanias { get; set; }
        
        // Tablas del sistema de Match
        public DbSet<Atributo> Atributos { get; set; }
        public DbSet<AnimalAtributo> AnimalAtributos { get; set; }
        public DbSet<PerfilAdoptante> PerfilesAdoptantes { get; set; }
        public DbSet<PreferenciaAdoptante> PreferenciasAdoptantes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Especies y Estados
            modelBuilder.Entity<Especie>().HasData(
                new Especie { Id = 1, Nombre = "Perro" },
                new Especie { Id = 2, Nombre = "Gato" }
            );

            modelBuilder.Entity<Estado>().HasData(
                new Estado { Id = 1, Nombre = "En Adopción" },
                new Estado { Id = 2, Nombre = "Perdido" },
                new Estado { Id = 3, Nombre = "Encontrado" }
            );

            // 2. Atributos (Preguntas)
            modelBuilder.Entity<Atributo>().HasData(
                new Atributo { Id = 1, Nombre = "Nivel de Energía", Tipo = "Escala" }, 
                new Atributo { Id = 2, Nombre = "Requiere Patio", Tipo = "Booleano" }, 
                new Atributo { Id = 3, Nombre = "Tolera Niños", Tipo = "Booleano" },
                new Atributo { Id = 4, Nombre = "Tolera Gatos", Tipo = "Booleano" },
                new Atributo { Id = 5, Nombre = "Tiempo de Atención", Tipo = "Escala" } 
            );

            // 3. Usuarios
            modelBuilder.Entity<Usuario>().HasData(
                new Usuario { Id = 1, NombreUsuario = "admin", PasswordHash = "admin123", Rol = "Administrador" },
                new Usuario { Id = 2, NombreUsuario = "juan", PasswordHash = "1234", Rol = "Ciudadano" },
                new Usuario { Id = 3, NombreUsuario = "maria", PasswordHash = "1234", Rol = "Ciudadano" }
            );

            // 4. Animales (Con FECHA FIJA para evitar error de migración infinita)
            string baseUrl = "http://127.0.0.1:5269/uploads/";
            var fechaFija = DateTime.Parse("2025-12-01"); 

            modelBuilder.Entity<Animal>().HasData(
                new Animal { Id = 1, Nombre = "Rocky", Descripcion = "Activo y juguetón.", EdadAproximada = "2 años", ImagenUrl = baseUrl + "PerroAdoptar1.png", UbicacionLat = -37.994, UbicacionLon = -61.353, FechaPublicacion = fechaFija, IdEspecie = 1, IdEstado = 1 },
                new Animal { Id = 2, Nombre = "Mishi", Descripcion = "Muy tranquila.", EdadAproximada = "4 años", ImagenUrl = baseUrl + "GatoAdoptar1.png", UbicacionLat = -37.996, UbicacionLon = -61.355, FechaPublicacion = fechaFija, IdEspecie = 2, IdEstado = 1 },
                new Animal { Id = 3, Nombre = "Tobi", Descripcion = "Perdido en plaza.", EdadAproximada = "Viejito", ImagenUrl = baseUrl + "PerroPerdido2.png", UbicacionLat = -37.992, UbicacionLon = -61.351, FechaPublicacion = fechaFija, IdEspecie = 1, IdEstado = 2 }
            );

            // 5. Atributos Animales (Valores)
            modelBuilder.Entity<AnimalAtributo>().HasData(
                // Rocky (Energía Alta, Con Patio)
                new AnimalAtributo { Id = 1, AnimalId = 1, AtributoId = 1, Valor = 5 }, 
                new AnimalAtributo { Id = 2, AnimalId = 1, AtributoId = 2, Valor = 1 }, 
                // Mishi (Energía Baja, Sin Patio)
                new AnimalAtributo { Id = 4, AnimalId = 2, AtributoId = 1, Valor = 1 }, 
                new AnimalAtributo { Id = 5, AnimalId = 2, AtributoId = 2, Valor = 0 }
            );

            // 6. Perfiles (Sin datos viejos que dan error)
            modelBuilder.Entity<PerfilAdoptante>().HasData(
                new PerfilAdoptante { Id = 1, UsuarioId = 2, TelefonoContacto = "111-222" },
                new PerfilAdoptante { Id = 2, UsuarioId = 3, TelefonoContacto = "333-444" }
            );

            // 7. Preferencias
            modelBuilder.Entity<PreferenciaAdoptante>().HasData(
                // Juan busca Energía Alta (5) y Patio (1)
                new PreferenciaAdoptante { Id = 1, PerfilAdoptanteId = 1, AtributoId = 1, ValorPreferido = 5, Importancia = 5 }, 
                new PreferenciaAdoptante { Id = 2, PerfilAdoptanteId = 1, AtributoId = 2, ValorPreferido = 1, Importancia = 3 },
                // Maria busca Energía Baja (1) y Sin Patio (0)
                new PreferenciaAdoptante { Id = 3, PerfilAdoptanteId = 2, AtributoId = 1, ValorPreferido = 1, Importancia = 5 }, 
                new PreferenciaAdoptante { Id = 4, PerfilAdoptanteId = 2, AtributoId = 2, ValorPreferido = 0, Importancia = 5 } 
            );
        }
    }
}