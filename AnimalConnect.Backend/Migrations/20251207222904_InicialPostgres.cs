using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InicialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Atributos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Tipo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Atributos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Campanias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titulo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FechaHora = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UbicacionLat = table.Column<double>(type: "double precision", nullable: false),
                    UbicacionLon = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campanias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Especies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Especies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Estados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estados", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NombreUsuario = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Rol = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Animales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    EdadAproximada = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ImagenUrl = table.Column<string>(type: "text", nullable: true),
                    UbicacionLat = table.Column<double>(type: "double precision", nullable: true),
                    UbicacionLon = table.Column<double>(type: "double precision", nullable: true),
                    FechaPublicacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    FechaUltimaRenovacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    TelefonoContacto = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    UsuarioId = table.Column<int>(type: "integer", nullable: true),
                    IdEspecie = table.Column<int>(type: "integer", nullable: false),
                    IdEstado = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Animales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Animales_Especies_IdEspecie",
                        column: x => x.IdEspecie,
                        principalTable: "Especies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Animales_Estados_IdEstado",
                        column: x => x.IdEstado,
                        principalTable: "Estados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Animales_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PerfilesAdoptantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    TelefonoContacto = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesAdoptantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilesAdoptantes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerfilesCiudadanos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    NombreCompleto = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Barrio = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Telefono = table.Column<string>(type: "text", nullable: true),
                    FotoPerfilUrl = table.Column<string>(type: "text", nullable: true),
                    FechaRegistro = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Puntos = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesCiudadanos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilesCiudadanos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerfilesMunicipios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    NombreMunicipio = table.Column<string>(type: "text", nullable: false),
                    Provincia = table.Column<string>(type: "text", nullable: false),
                    LatitudCentro = table.Column<double>(type: "double precision", nullable: false),
                    LongitudCentro = table.Column<double>(type: "double precision", nullable: false),
                    RadioCoberturaKm = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesMunicipios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilesMunicipios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerfilesVeterinarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    NombreVeterinaria = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MatriculaProfesional = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Direccion = table.Column<string>(type: "text", nullable: false),
                    TelefonoProfesional = table.Column<string>(type: "text", nullable: false),
                    Latitud = table.Column<double>(type: "double precision", nullable: false),
                    Longitud = table.Column<double>(type: "double precision", nullable: false),
                    HorariosAtencion = table.Column<string>(type: "text", nullable: false),
                    EstadoVerificacion = table.Column<string>(type: "text", nullable: false),
                    EsDeTurno = table.Column<bool>(type: "boolean", nullable: false),
                    Biografia = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    LogoUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesVeterinarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilesVeterinarios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Posts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titulo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Contenido = table.Column<string>(type: "text", nullable: false),
                    FechaPublicacion = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Categoria = table.Column<string>(type: "text", nullable: false),
                    ImagenUrl = table.Column<string>(type: "text", nullable: true),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Posts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Posts_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnimalAtributos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AnimalId = table.Column<int>(type: "integer", nullable: false),
                    AtributoId = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnimalAtributos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnimalAtributos_Animales_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AnimalAtributos_Atributos_AtributoId",
                        column: x => x.AtributoId,
                        principalTable: "Atributos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PreferenciasAdoptantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PerfilAdoptanteId = table.Column<int>(type: "integer", nullable: false),
                    AtributoId = table.Column<int>(type: "integer", nullable: false),
                    ValorPreferido = table.Column<int>(type: "integer", nullable: false),
                    Importancia = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PreferenciasAdoptantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PreferenciasAdoptantes_Atributos_AtributoId",
                        column: x => x.AtributoId,
                        principalTable: "Atributos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PreferenciasAdoptantes_PerfilesAdoptantes_PerfilAdoptanteId",
                        column: x => x.PerfilAdoptanteId,
                        principalTable: "PerfilesAdoptantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comentarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Contenido = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    PostId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comentarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Comentarios_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Comentarios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnimalAtributos_AnimalId",
                table: "AnimalAtributos",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_AnimalAtributos_AtributoId",
                table: "AnimalAtributos",
                column: "AtributoId");

            migrationBuilder.CreateIndex(
                name: "IX_Animales_IdEspecie",
                table: "Animales",
                column: "IdEspecie");

            migrationBuilder.CreateIndex(
                name: "IX_Animales_IdEstado",
                table: "Animales",
                column: "IdEstado");

            migrationBuilder.CreateIndex(
                name: "IX_Animales_UsuarioId",
                table: "Animales",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_PostId",
                table: "Comentarios",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Comentarios_UsuarioId",
                table: "Comentarios",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilesAdoptantes_UsuarioId",
                table: "PerfilesAdoptantes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilesCiudadanos_UsuarioId",
                table: "PerfilesCiudadanos",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PerfilesMunicipios_UsuarioId",
                table: "PerfilesMunicipios",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PerfilesVeterinarios_UsuarioId",
                table: "PerfilesVeterinarios",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Posts_UsuarioId",
                table: "Posts",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_PreferenciasAdoptantes_AtributoId",
                table: "PreferenciasAdoptantes",
                column: "AtributoId");

            migrationBuilder.CreateIndex(
                name: "IX_PreferenciasAdoptantes_PerfilAdoptanteId",
                table: "PreferenciasAdoptantes",
                column: "PerfilAdoptanteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnimalAtributos");

            migrationBuilder.DropTable(
                name: "Campanias");

            migrationBuilder.DropTable(
                name: "Comentarios");

            migrationBuilder.DropTable(
                name: "PerfilesCiudadanos");

            migrationBuilder.DropTable(
                name: "PerfilesMunicipios");

            migrationBuilder.DropTable(
                name: "PerfilesVeterinarios");

            migrationBuilder.DropTable(
                name: "PreferenciasAdoptantes");

            migrationBuilder.DropTable(
                name: "Animales");

            migrationBuilder.DropTable(
                name: "Posts");

            migrationBuilder.DropTable(
                name: "Atributos");

            migrationBuilder.DropTable(
                name: "PerfilesAdoptantes");

            migrationBuilder.DropTable(
                name: "Especies");

            migrationBuilder.DropTable(
                name: "Estados");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
