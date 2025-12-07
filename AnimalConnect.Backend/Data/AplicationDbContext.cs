using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Animal> Animales { get; set; }
        public DbSet<Especie> Especies { get; set; }
        public DbSet<Estado> Estados { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Campania> Campanias { get; set; }
        public DbSet<Atributo> Atributos { get; set; }
        public DbSet<AnimalAtributo> AnimalAtributos { get; set; }
        public DbSet<PerfilAdoptante> PerfilesAdoptantes { get; set; }
        public DbSet<PreferenciaAdoptante> PreferenciasAdoptantes { get; set; }
        public DbSet<PerfilCiudadano> PerfilesCiudadanos { get; set; }
        public DbSet<PerfilVeterinario> PerfilesVeterinarios { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comentario> Comentarios { get; set; }
        public DbSet<PerfilMunicipio> PerfilesMunicipios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // ¡Ya no hay HasData aquí! Se cargará dinámicamente en el DbInitializer.

            modelBuilder.Entity<Comentario>()
                .HasOne(c => c.Usuario)
                .WithMany()
                .HasForeignKey(c => c.UsuarioId)
                .OnDelete(DeleteBehavior.NoAction);
                }
            }
}