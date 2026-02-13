using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace AnimalConnect.Backend.Services
{
    public static class GeoService
    {
        // Factory para crear Puntos (WGS84)
        public static Point CreatePoint(double lat, double lon)
        {
            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
            return geometryFactory.CreatePoint(new Coordinate(lon, lat));
        }

        // Calcula la distancia en Kilómetros entre dos puntos (Haversine - Client Side)
        public static double CalcularDistanciaKm(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371; // Radio de la tierra en km
            var dLat = ToRad(lat2 - lat1);
            var dLon = ToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private static double ToRad(double angle) => Math.PI * angle / 180.0;
    }
}