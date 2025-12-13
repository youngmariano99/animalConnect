using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarOrganizacionesYHogares : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HogaresTransitorios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    DireccionAproximada = table.Column<string>(type: "text", nullable: false),
                    Latitud = table.Column<double>(type: "double precision", nullable: false),
                    Longitud = table.Column<double>(type: "double precision", nullable: false),
                    TipoVivienda = table.Column<string>(type: "text", nullable: false),
                    TienePatioCerrado = table.Column<bool>(type: "boolean", nullable: false),
                    TieneOtrasMascotas = table.Column<bool>(type: "boolean", nullable: false),
                    TieneNinos = table.Column<bool>(type: "boolean", nullable: false),
                    DisponibilidadHoraria = table.Column<int>(type: "integer", nullable: false),
                    TiempoCompromiso = table.Column<string>(type: "text", nullable: false),
                    AceptaCuidadosEspeciales = table.Column<bool>(type: "boolean", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false),
                    FechaAlta = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UltimaActualizacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HogaresTransitorios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HogaresTransitorios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerfilesOrganizaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    TelefonoContacto = table.Column<string>(type: "text", nullable: true),
                    EmailContacto = table.Column<string>(type: "text", nullable: true),
                    RedesSociales = table.Column<string>(type: "text", nullable: true),
                    Barrio = table.Column<string>(type: "text", nullable: false),
                    Ciudad = table.Column<string>(type: "text", nullable: false),
                    LatitudSede = table.Column<double>(type: "double precision", nullable: true),
                    LongitudSede = table.Column<double>(type: "double precision", nullable: true),
                    EstadoVerificacion = table.Column<string>(type: "text", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesOrganizaciones", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MiembrosOrganizaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    PerfilOrganizacionId = table.Column<int>(type: "integer", nullable: false),
                    RolEnOrganizacion = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MiembrosOrganizaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MiembrosOrganizaciones_PerfilesOrganizaciones_PerfilOrganiz~",
                        column: x => x.PerfilOrganizacionId,
                        principalTable: "PerfilesOrganizaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MiembrosOrganizaciones_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HogaresTransitorios_UsuarioId",
                table: "HogaresTransitorios",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MiembrosOrganizaciones_PerfilOrganizacionId",
                table: "MiembrosOrganizaciones",
                column: "PerfilOrganizacionId");

            migrationBuilder.CreateIndex(
                name: "IX_MiembrosOrganizaciones_UsuarioId",
                table: "MiembrosOrganizaciones",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HogaresTransitorios");

            migrationBuilder.DropTable(
                name: "MiembrosOrganizaciones");

            migrationBuilder.DropTable(
                name: "PerfilesOrganizaciones");
        }
    }
}
