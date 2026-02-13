using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class PostGIS_Refactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitud",
                table: "Comercios");

            migrationBuilder.DropColumn(
                name: "Longitud",
                table: "Comercios");

            migrationBuilder.DropColumn(
                name: "Latitud",
                table: "Clinicas");

            migrationBuilder.DropColumn(
                name: "Longitud",
                table: "Clinicas");

            migrationBuilder.DropColumn(
                name: "UbicacionLat",
                table: "Animales");

            migrationBuilder.DropColumn(
                name: "UbicacionLon",
                table: "Animales");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.AddColumn<Point>(
                name: "Ubicacion",
                table: "Comercios",
                type: "geometry(Point, 4326)",
                nullable: false);

            migrationBuilder.AddColumn<Point>(
                name: "Ubicacion",
                table: "Clinicas",
                type: "geometry(Point, 4326)",
                nullable: false);

            migrationBuilder.AddColumn<Point>(
                name: "Ubicacion",
                table: "Animales",
                type: "geometry(Point, 4326)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ubicacion",
                table: "Comercios");

            migrationBuilder.DropColumn(
                name: "Ubicacion",
                table: "Clinicas");

            migrationBuilder.DropColumn(
                name: "Ubicacion",
                table: "Animales");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.AddColumn<double>(
                name: "Latitud",
                table: "Comercios",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitud",
                table: "Comercios",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Latitud",
                table: "Clinicas",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitud",
                table: "Clinicas",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "UbicacionLat",
                table: "Animales",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "UbicacionLon",
                table: "Animales",
                type: "double precision",
                nullable: true);
        }
    }
}
