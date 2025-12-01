using System.ComponentModel.DataAnnotations;

namespace AnimalConnect.Backend.Models
{
    public class Estado
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty; // Ej: En Adopción, Perdido
    }
}