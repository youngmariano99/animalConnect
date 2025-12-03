using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class PreferenciaAdoptante
    {
        public int Id { get; set; }

        public int PerfilAdoptanteId { get; set; }
        [ForeignKey("PerfilAdoptanteId")]
        public virtual PerfilAdoptante? PerfilAdoptante { get; set; }

        public int AtributoId { get; set; }
        [ForeignKey("AtributoId")]
        public virtual Atributo? Atributo { get; set; }

        public int ValorPreferido { get; set; }
        
        // Ponderación: ¿Qué tan importante es esto para el usuario?
        // 1: Da igual, 5: Excluyente (Como sugiere el informe técnico)
        public int Importancia { get; set; } = 3; 
    }
}