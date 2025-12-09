using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        

        // GET: api/Admin/dashboard-stats/{municipioId}
        [HttpGet("dashboard-stats/{usuarioId}")]
        public async Task<ActionResult> GetEstadisticasMunicipio(int usuarioId)
        {
            // 1. Obtener configuración del Municipio
            var muni = await _context.PerfilesMunicipios.FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);
            if (muni == null) return BadRequest("No es una cuenta de municipio.");

            // 2. Traer todos los animales (Nota: En producción se hace con Spatial Data en SQL, aquí lo hacemos en memoria por simplicidad)
            var todosAnimales = await _context.Animales.ToListAsync();

            // 3. Filtrar por Distancia (Radio de Cobertura)
            var animalesEnZona = todosAnimales.Where(a => 
                a.UbicacionLat.HasValue && 
                CalcularDistancia(muni.LatitudCentro, muni.LongitudCentro, a.UbicacionLat.Value, a.UbicacionLon.Value) <= muni.RadioCoberturaKm
            ).ToList();

            // 4. Calcular Métricas
            var stats = new {
                TotalReportes = animalesEnZona.Count,
                Perros = animalesEnZona.Count(a => a.IdEspecie == 1),
                Gatos = animalesEnZona.Count(a => a.IdEspecie == 2),
                PerdidosActivos = animalesEnZona.Count(a => a.IdEstado == 2),
                // Datos para el mapa de calor (solo lat/lon)
                PuntosCalor = animalesEnZona.Select(a => new { lat = a.UbicacionLat, lng = a.UbicacionLon })
            };

            return Ok(stats);
        }

        // Fórmula de Haversine para calcular distancia en KM entre dos coordenadas
        private double CalcularDistancia(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Radio tierra km
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }
        private double ToRad(double angle) => Math.PI * angle / 180.0;

        // GET: api/Admin/animales-zona/{usuarioId}
        // Este endpoint llena la tabla del Admin con datos filtrados geográficamente
        [HttpGet("animales-zona/{usuarioId}")]
        public async Task<ActionResult> GetAnimalesPorZona(int usuarioId)
        {
            // 1. Obtener perfil del municipio
            var muni = await _context.PerfilesMunicipios.FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);
            if (muni == null) return BadRequest("No es una cuenta de municipio.");

            // 2. Traer animales (Idealmente usar DbGeography en SQL, pero usamos Haversine en memoria)
            // Incluimos Especie y Estado para mostrar en la tabla
            var todos = await _context.Animales
                                      .Include(a => a.Especie)
                                      .Include(a => a.Estado)
                                      .ToListAsync();

            // 3. Filtrar
            var filtrados = todos.Where(a => 
                a.UbicacionLat.HasValue && 
                CalcularDistancia(muni.LatitudCentro, muni.LongitudCentro, a.UbicacionLat.Value, a.UbicacionLon.Value) <= muni.RadioCoberturaKm
            )
            .OrderByDescending(a => a.FechaPublicacion) // Los más recientes primero
            .ToList();

            return Ok(filtrados);
        }
    }

    
}
