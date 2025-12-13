using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class PerfilOrganizacion
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Descripcion { get; set; } // Misión, visión o bio corta

        [MaxLength(200)]
        public string? LogoUrl { get; set; }

        // --- Datos de Contacto Público ---
        public string? TelefonoContacto { get; set; }
        public string? EmailContacto { get; set; }
        public string? RedesSociales { get; set; } // Ej: "IG: @refugio | FB: /refugio"

        // --- Ubicación Aproximada ---
        public string Barrio { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        // Las ONGs no siempre tienen una sede física abierta al público, 
        // a veces son redes de hogares, por eso Lat/Lng es opcional.
        public double? LatitudSede { get; set; }
        public double? LongitudSede { get; set; }

        // --- Validación (Igual que Vets) ---
        // "Pendiente", "Aprobado", "Rechazado"
        public string EstadoVerificacion { get; set; } = "Pendiente";
        
        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        // Relación con los miembros (Usuarios que administran esta ONG)
        public virtual ICollection<MiembroOrganizacion>? Miembros { get; set; }
    }
}