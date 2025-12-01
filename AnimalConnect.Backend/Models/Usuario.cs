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

        public string Rol { get; set; } = "Admin";
    }
}