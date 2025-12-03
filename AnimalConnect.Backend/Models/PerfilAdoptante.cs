using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class PerfilAdoptante
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        // Datos fijos del humano que no son atributos de match (opcional)
        public string? TelefonoContacto { get; set; }
        
        // Relación con sus preferencias (Matches)
        public virtual ICollection<PreferenciaAdoptante>? Preferencias { get; set; }
    }
}