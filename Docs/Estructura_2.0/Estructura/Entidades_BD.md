1. Bloque Base (Core)

# EntidadAuditable

using System.ComponentModel.DataAnnotations;

public abstract class EntidadAuditable
{
    [Key]
    public int Id { get; set; } // Estándar global

    // Auditoría
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? CreatedBy { get; set; } // Id del Usuario creador

    public DateTime? LastModifiedAt { get; set; }
    public int? LastModifiedBy { get; set; }

    // Soft Delete (Borrado Lógico)
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public int? DeletedBy { get; set; }
}


2. Módulo de Identidad y Perfiles

# Usuario : EntidadAuditable

using NetTopologySuite.Geometries; // Para ubicación del usuario

public class Usuario : EntidadAuditable
{
    // Datos de Acceso
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    
    // Perfil
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string? FotoPerfilUrl { get; set; }
    public string? Telefono { get; set; } // Para WhatsApp
    
    // Ubicación (Hogar por defecto para búsquedas)
    public Point? UbicacionHogar { get; set; } 
    public string? DireccionTexto { get; set; } // "Calle Falsa 123"

    // Gamificación y Roles
    public int PuntosKarma { get; set; } = 0;
    public NivelUsuario Nivel { get; set; } = NivelUsuario.Turista; // Enum
    public bool IdentidadVerificada { get; set; } = false; // Check de Didit (KYC)

    // Relaciones (Navegación)
    public virtual PerfilProfesional? PerfilProfesional { get; set; } // Si es Vet/ONG
    public virtual ICollection<Mascota> Mascotas { get; set; }
}

# PerfilProfesional : EntidadAuditable

public class PerfilProfesional : EntidadAuditable
{
    public int UsuarioId { get; set; }
    public TipoProfesional Tipo { get; set; } // Enum: Veterinario, ONG, Comercio
    
    // Validación
    public string? NumeroMatricula { get; set; } // Para Vets
    public string? NumeroCenoc { get; set; } // Para ONGs
    public string? DocumentoProbatorioUrl { get; set; } // Foto del título/habilitación
    
    public EstadoVerificacion Estado { get; set; } = EstadoVerificacion.Pendiente;
    
    // Datos Públicos
    public string NombreFantasia { get; set; } = string.Empty; // "Veterinaria Pringles"
    public string? Biografia { get; set; }
}

3. Módulo de Mascotas y Salud (El "Gancho")

# Mascota : EntidadAuditable

public class Mascota : EntidadAuditable
{
    public int UsuarioId { get; set; } // El Dueño
    
    public string Nombre { get; set; } = string.Empty;
    public Especie Especie { get; set; } // Enum: Perro, Gato
    public string Raza { get; set; } = "Mestizo";
    public string Color { get; set; } = string.Empty;
    public DateTime FechaNacimientoEstimada { get; set; }
    public SexoAnimal Sexo { get; set; } // Enum: Macho, Hembra
    public bool EstaCastrado { get; set; }
    public string? FotoPrincipalUrl { get; set; }

    // Datos para el Match (Algoritmo)
    public int NivelEnergia { get; set; } // 1 a 10
    public bool SociableConNiños { get; set; }
    public bool SociableConPerros { get; set; }
    public bool SociableConGatos { get; set; }
    public int ToleranciaSoledad { get; set; } // 1 a 10

    public virtual ICollection<RegistroSalud> HistoriaClinica { get; set; }
}

# RegistroSalud : EntidadAuditable

public class RegistroSalud : EntidadAuditable
{
    public int MascotaId { get; set; }
    
    public TipoEventoSalud Tipo { get; set; } // Enum: Vacuna, Desparasitacion, Consulta
    public string NombreProducto { get; set; } = string.Empty; // "Antirrábica", "Pipeta"
    public DateTime FechaAplicacion { get; set; }
    public DateTime? FechaVencimiento { get; set; } // Para la notificación Push
    
    public string? FotoEtiquetaUrl { get; set; } // Evidencia
    public int? VeterinarioVerificadorId { get; set; } // Si lo cargó un Vet verificado
}

4. Módulo de Publicaciones (Geo-Social)

# Publicacion : EntidadAuditable

using NetTopologySuite.Geometries;

public class Publicacion : EntidadAuditable
{
    public int UsuarioId { get; set; }
    public int? MascotaId { get; set; } // Null si es un "Encontrado" (no tengo el perfil)
    
    public TipoPublicacion Tipo { get; set; } // Perdido, Encontrado, Adopcion
    public EstadoPublicacion Estado { get; set; } = EstadoPublicacion.Activa; // Activa, Pausada, Cerrada
    
    // Datos del Suceso
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public Point Ubicacion { get; set; } // Dónde se perdió/encontró
    public DateTime FechaSuceso { get; set; }
    
    // Viralidad
    public string? QrCartelUrl { get; set; } // URL del PDF generado
    
    // Higiene de Datos
    public DateTime FechaVencimiento { get; set; } // TTL (30 días)
}

# Avistamiento : EntidadAuditable 

public class Avistamiento : EntidadAuditable
{
    public int PublicacionId { get; set; }
    public int UsuarioReportadorId { get; set; }
    
    public Point UbicacionAvistamiento { get; set; }
    public string? Mensaje { get; set; }
    public string? FotoPruebaUrl { get; set; }
    public bool EsVerdadero { get; set; } // Validación del dueño
}

5. Módulo de Servicios y Tránsito (Privacidad)

# Comercio : EntidadAuditable

public class Comercio : EntidadAuditable
{
    public int UsuarioId { get; set; } // Dueño del comercio
    
    public string Nombre { get; set; } = string.Empty;
    public RubroComercio Rubro { get; set; } // Farmacia, PetShop, Guarderia
    public Point Ubicacion { get; set; }
    public string DireccionVisible { get; set; } = string.Empty;
    
    public bool EsDeTurno { get; set; } // Para Farmacias
    public DateTime? FinDeTurno { get; set; } // Para limpiar automático
}

# HogarTransito : EntidadAuditable

public class HogarTransito : EntidadAuditable
{
    public int UsuarioId { get; set; }
    
    // Capacidad
    public bool AceptaPerros { get; set; }
    public bool AceptaGatos { get; set; }
    public bool TienePatioCerrado { get; set; }
    
    // SEGURIDAD (Geo-Fuzzing)
    public Point UbicacionReal { get; set; } // PRIVADO: Solo para cálculos
    public Point UbicacionOfuscada { get; set; } // PÚBLICO: Desplazado 200m (Donut)
    public string Barrio { get; set; } = string.Empty; // Referencia aproximada
}

6. Enums Necesarios (Copiar en Domain/Enums)

# Enums

public enum NivelUsuario { Turista, Vecino, Guardian, Heroe }
public enum TipoProfesional { Veterinario, Ong, Comercio }
public enum Especie { Perro, Gato, Otro }
public enum TipoEventoSalud { Vacuna, Desparasitacion, Cirugia, Consulta }
public enum TipoPublicacion { Perdido, Encontrado, Adopcion, Transito }
public enum EstadoPublicacion { Activa, Pausada, FinalizadaExito, FinalizadaSinExito }
public enum RubroComercio { Farmacia, Veterinaria, PetShop, Peluqueria, Adiestrador }