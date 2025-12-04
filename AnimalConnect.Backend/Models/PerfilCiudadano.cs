using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class PerfilCiudadano
    {
        [Key]
        public int Id { get; set; }

        // --- RELACIÓN CON USUARIO ---
        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        // --- DATOS PERSONALES ---
        [MaxLength(100)]
        public string NombreCompleto { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string Barrio { get; set; } = string.Empty;
        
        public string? Telefono { get; set; }
        public string? FotoPerfilUrl { get; set; }

        // Fecha de registro para gamificación (ej: "Miembro desde 2024")
        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        public int Puntos { get; set; } = 0; // Se suman al aportar a la comunidad
    }
}