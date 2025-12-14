using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HogaresController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HogaresController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class NuevoHogarDto
        {
            public int UsuarioId { get; set; }
            public string Direccion { get; set; } = string.Empty;
            public double Latitud { get; set; }
            public double Longitud { get; set; }
            public string TipoVivienda { get; set; } = "Casa";
            public bool TienePatio { get; set; }
            public bool TieneMascotas { get; set; }
            public bool TieneNinos { get; set; }
            public int Disponibilidad { get; set; } // 1, 2, 3
            public string Tiempo { get; set; } = string.Empty;
            public bool CuidadosEsp { get; set; }
        }

        // POST: api/Hogares
        [HttpPost]
        public async Task<IActionResult> CrearHogar([FromBody] NuevoHogarDto dto)
        {
            // 1. Verificar si ya tiene un hogar registrado
            if (await _context.HogaresTransitorios.AnyAsync(h => h.UsuarioId == dto.UsuarioId))
            {
                return BadRequest("Ya tienes un hogar de tránsito registrado.");
            }

            var hogar = new HogarTransitorio
            {
                UsuarioId = dto.UsuarioId,
                DireccionAproximada = dto.Direccion,
                Latitud = dto.Latitud,
                Longitud = dto.Longitud,
                TipoVivienda = dto.TipoVivienda,
                TienePatioCerrado = dto.TienePatio,
                TieneOtrasMascotas = dto.TieneMascotas,
                TieneNinos = dto.TieneNinos,
                DisponibilidadHoraria = dto.Disponibilidad,
                TiempoCompromiso = dto.Tiempo,
                AceptaCuidadosEspeciales = dto.CuidadosEsp,
                Estado = "Activo",
                FechaAlta = DateTime.Now,
                UltimaActualizacion = DateTime.Now
            };

            _context.HogaresTransitorios.Add(hogar);
            await _context.SaveChangesAsync();

            return Ok(new { message = "¡Gracias! Tu hogar ahora es parte de la red de tránsito.", id = hogar.Id });
        }

        // GET: api/Hogares/mi-hogar/{usuarioId}
        [HttpGet("mi-hogar/{usuarioId}")]
        public async Task<ActionResult> GetMiHogar(int usuarioId)
        {
            var hogar = await _context.HogaresTransitorios
                                      .FirstOrDefaultAsync(h => h.UsuarioId == usuarioId);
            
            if (hogar == null) return NotFound();
            return Ok(hogar);
        }

        // GET: api/Hogares/buscar
        [HttpGet("buscar")]
        public async Task<ActionResult> BuscarHogares(
            [FromQuery] int usuarioSolicitanteId,
            [FromQuery] double? lat, 
            [FromQuery] double? lng, 
            [FromQuery] double radio = 10, // 10km por defecto
            [FromQuery] string? tipo = null,
            [FromQuery] bool? patio = null,
            [FromQuery] bool? mascotas = null,
            [FromQuery] bool? ninos = null,
            [FromQuery] bool? cuidados = null)
        {
            // 1. SEGURIDAD: Verificar si el usuario pertenece a una ONG APROBADA
            // (O si es SuperAdmin, que también debería poder ver)
            var esMiembroValido = await _context.MiembrosOrganizaciones
                .Include(m => m.Organizacion)
                .AnyAsync(m => m.UsuarioId == usuarioSolicitanteId && 
                               m.Organizacion.EstadoVerificacion == "Aprobado");

            var esSuperAdmin = await _context.Usuarios
                .AnyAsync(u => u.Id == usuarioSolicitanteId && u.Rol == "Administrador" || u.Rol == "Municipio");

            if (!esMiembroValido && !esSuperAdmin)
            {
                return Unauthorized("Solo organizaciones verificadas pueden acceder a la red de tránsitos.");
            }

            // 2. FILTRADO

            // Solo mostramos hogares actualizados en los últimos 30 días
            var fechaLimite = DateTime.Now.AddDays(-30);
            
            var query = _context.HogaresTransitorios
                                .Include(h => h.Usuario) // Para mostrar nombre/teléfono
                                .AsQueryable();
            query = query.Where(h => h.UltimaActualizacion >= fechaLimite);


            // Filtros básicos CORREGIDOS
            if (!string.IsNullOrEmpty(tipo)) query = query.Where(h => h.TipoVivienda == tipo);
            
            // Lógica corregida: Filtra si es true O false. 
            // Si el front manda patio=true, busca con patio. Si manda patio=false, busca sin patio.
            if (patio.HasValue) query = query.Where(h => h.TienePatioCerrado == patio.Value);
            
            // Aquí está el error clave: Antes tenías (mascotas.Value) lo que ignoraba el false.
            if (mascotas.HasValue) query = query.Where(h => h.TieneOtrasMascotas == mascotas.Value);
            
            if (ninos.HasValue) query = query.Where(h => h.TieneNinos == ninos.Value);
            
            if (cuidados.HasValue) query = query.Where(h => h.AceptaCuidadosEspeciales == cuidados.Value);

            var lista = await query.ToListAsync();

            // 3. FILTRO GEOGRÁFICO (En memoria) y PROYECCIÓN
            var resultado = lista.Select(h => new
            {
                h.Id,
                h.DireccionAproximada,
                h.Latitud,
                h.Longitud,
                h.TipoVivienda,
                h.TienePatioCerrado,
                h.DisponibilidadHoraria,
                h.TiempoCompromiso,
                // Datos de contacto (Solo visibles aquí)
                NombreContacto = h.Usuario?.NombreUsuario, // O PerfilCiudadano.Nombre si lo unimos
                Distancia = (lat.HasValue && lng.HasValue) 
                    ? Services.GeoService.CalcularDistanciaKm(lat.Value, lng.Value, h.Latitud, h.Longitud)
                    : 0
            });

            if (lat.HasValue && lng.HasValue)
            {
                resultado = resultado.Where(x => x.Distancia <= radio);
            }

            return Ok(resultado.OrderBy(x => x.Distancia));
        }

        // 1. EDITAR HOGAR (PUT)
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarHogar(int id, [FromBody] NuevoHogarDto dto)
        {
            var hogar = await _context.HogaresTransitorios.FindAsync(id);
            if (hogar == null) return NotFound("Hogar no encontrado.");

            // Validar que el usuario sea el dueño
            if (hogar.UsuarioId != dto.UsuarioId) return Unauthorized();

            // Actualizamos campos
            hogar.DireccionAproximada = dto.Direccion;
            hogar.Latitud = dto.Latitud;
            hogar.Longitud = dto.Longitud;
            hogar.TipoVivienda = dto.TipoVivienda;
            hogar.TienePatioCerrado = dto.TienePatio;
            hogar.TieneOtrasMascotas = dto.TieneMascotas;
            hogar.TieneNinos = dto.TieneNinos;
            hogar.DisponibilidadHoraria = dto.Disponibilidad;
            hogar.TiempoCompromiso = dto.Tiempo;
            hogar.AceptaCuidadosEspeciales = dto.CuidadosEsp;
            
            // Al editar, también renovamos la fecha para que suba en el listado
            hogar.UltimaActualizacion = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Datos del hogar actualizados correctamente." });
        }

        // 2. ELIMINAR HOGAR (DELETE)
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarHogar(int id)
        {
            var hogar = await _context.HogaresTransitorios.FindAsync(id);
            if (hogar == null) return NotFound();

            _context.HogaresTransitorios.Remove(hogar);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hogar eliminado y dado de baja del sistema." });
        }

        // 3. RENOVAR / REACTIVAR (PUT) - (Asegúrate de que este esté presente)
        [HttpPut("renovar/{id}")]
        public async Task<IActionResult> RenovarHogar(int id)
        {
            var hogar = await _context.HogaresTransitorios.FindAsync(id);
            if (hogar == null) return NotFound();

            hogar.UltimaActualizacion = DateTime.Now;
            // Si estaba en pausa o inactivo, lo reactivamos
            hogar.Estado = "Activo"; 
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Publicación renovada por 30 días más." });
        }
    }
}