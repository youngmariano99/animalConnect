using System.ComponentModel.DataAnnotations;

namespace AnimalConnect.Backend.Models
{
    public class Atributo
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty; // Ej: "Nivel de Energía", "Requiere Patio"

        [MaxLength(20)]
        public string Tipo { get; set; } = "Booleano"; // "Booleano" (Si/No) o "Escala" (1 al 5)
    }
}