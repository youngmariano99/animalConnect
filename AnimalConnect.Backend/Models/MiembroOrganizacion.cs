using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class MiembroOrganizacion
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        public int PerfilOrganizacionId { get; set; }
        [ForeignKey("PerfilOrganizacionId")]
        public virtual PerfilOrganizacion? Organizacion { get; set; }

        // "Creador", "Admin", "Voluntario"
        public string RolEnOrganizacion { get; set; } = "Voluntario";
    }
}