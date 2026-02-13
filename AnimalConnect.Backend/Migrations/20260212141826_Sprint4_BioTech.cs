using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class Sprint4_BioTech : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NivelEnergia",
                table: "Animales",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NivelInstintoPresa",
                table: "Animales",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NivelMantenimiento",
                table: "Animales",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NivelSociabilidadGatos",
                table: "Animales",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NivelSociabilidadNinos",
                table: "Animales",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NivelSociabilidadPerros",
                table: "Animales",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "PesoActual",
                table: "Animales",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<int>(
                name: "ToleranciaSoledad",
                table: "Animales",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Vacunas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Marca = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Lote = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    FechaAplicacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    FechaProxima = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Veterinario = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    AnimalId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vacunas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vacunas_Animales_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Vacunas_AnimalId",
                table: "Vacunas",
                column: "AnimalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Vacunas");

            migrationBuilder.DropColumn(
                name: "NivelEnergia",
                table: "Animales");

            migrationBuilder.DropColumn(
                name: "NivelInstintoPresa",
                table: "Animales");

            migrationBuilder.DropColumn(
                name: "NivelMantenimiento",
                table: "Animales");

            migrationBuilder.DropColumn(
                name: "NivelSociabilidadGatos",
                table: "Animales");

            migrationBuilder.DropColumn(
                name: "NivelSociabilidadNinos",
                table: "Animales");

            migrationBuilder.DropColumn(
                name: "NivelSociabilidadPerros",
                table: "Animales");

            migrationBuilder.DropColumn(
                name: "PesoActual",
                table: "Animales");

            migrationBuilder.DropColumn(
                name: "ToleranciaSoledad",
                table: "Animales");
        }
    }
}
