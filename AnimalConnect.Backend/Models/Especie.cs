using System.ComponentModel.DataAnnotations;

namespace AnimalConnect.Backend.Models
{
    public class Especie
    {
        public int Id { get; set; }

        [Required] // Esto hace que en SQL sea NOT NULL
        [MaxLength(50)] // Esto define un VARCHAR(50)
        public string Nombre { get; set; } = string.Empty; // Ej: Perro, Gato
    }
}