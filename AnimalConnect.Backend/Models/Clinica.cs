using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class Clinica
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }

        // --- SAAS GEOGRÁFICO ---
        public double Latitud { get; set; }
        public double Longitud { get; set; }

        // --- LÓGICA DE NEGOCIO ---
        public bool EsDeTurno { get; set; } = false;
        
        // [NUEVO] Para controlar la expiración de 24hs
        public DateTime? FechaInicioTurno { get; set; } 

        public string HorariosEstructurados { get; set; } = string.Empty;

        public int PerfilVeterinarioId { get; set; }
        [ForeignKey("PerfilVeterinarioId")]
        public virtual PerfilVeterinario? Dueño { get; set; }

        public virtual ICollection<HorarioClinica>? Horarios { get; set; }
    }
}