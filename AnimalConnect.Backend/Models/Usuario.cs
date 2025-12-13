using System.ComponentModel.DataAnnotations;

namespace AnimalConnect.Backend.Models
{
    public class Usuario
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty; // ¡Nunca guardar contraseña plana!

        public string Rol { get; set; } = "Admin"; // Roles: "Admin", "Ciudadano", "Veterinario"

        public virtual PerfilCiudadano? PerfilCiudadano { get; set; }
        public virtual PerfilVeterinario? PerfilVeterinario { get; set; }
        public virtual PerfilMunicipio? PerfilMunicipio { get; set; }
        public virtual ICollection<MiembroOrganizacion>? Organizaciones { get; set; }
        public virtual HogarTransitorio? HogarTransitorio { get; set; }
        
        // Mantenemos la relación existente con adopción para no romper el Match
        // (Nota: En el futuro podríamos fusionar PerfilAdoptante dentro de Ciudadano, 
        // pero por ahora mejor mantenerlos separados para asegurar estabilidad).
        // public virtual PerfilAdoptante? PerfilAdoptante { get; set; } <--- (Seguro ya lo tienes o se infiere)
    }
}
