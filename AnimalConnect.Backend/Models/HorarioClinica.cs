using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class HorarioClinica
    {
        public int Id { get; set; }

        public int ClinicaId { get; set; }
        [ForeignKey("ClinicaId")]
        public virtual Clinica? Clinica { get; set; }

        // Usaremos enteros para facilitar el ordenamiento: 0=Domingo, 1=Lunes... 6=Sábado
        public int DiaSemana { get; set; } 

        // Guardamos como string "08:00" o TimeSpan. String es más fácil para el JSON.
        [MaxLength(5)]
        public string HoraApertura { get; set; } = string.Empty;

        [MaxLength(5)]
        public string HoraCierre { get; set; } = string.Empty;
    }
}