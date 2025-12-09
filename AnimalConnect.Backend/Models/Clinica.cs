using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class Clinica
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty; // Ej: "Veterinaria San Roque"

        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }

        // --- SAAS GEOGRÁFICO ---
        public double Latitud { get; set; }
        public double Longitud { get; set; }

        // --- LÓGICA DE NEGOCIO ---
        public bool EsDeTurno { get; set; } = false;

        public string HorariosEstructurados { get; set; } = string.Empty;

        // Relación: ¿Quién es el dueño/administrador?
        public int PerfilVeterinarioId { get; set; }
        [ForeignKey("PerfilVeterinarioId")]
        public virtual PerfilVeterinario? Dueño { get; set; }

        // Relación con Horarios
        public virtual ICollection<HorarioClinica>? Horarios { get; set; }
    }
}