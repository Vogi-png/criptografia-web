using Criptografia.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("Content-Disposition"));
});

var app = builder.Build();

// CORS precisa vir PRIMEIRO — antes do Swagger e dos Controllers.
// Sem isso, o navegador bloqueia as respostas por política de segurança.
app.UseCors("AllowFrontend");

// Swagger fica depois do CORS
app.UseSwagger();
app.UseSwaggerUI();

// UseHttpsRedirection() foi removido pois causava problemas locais:
// o backend redirecionava HTTP → HTTPS, e o CORS não era aplicado
// na resposta de redirecionamento, causando bloqueio no navegador.

app.MapControllers();

app.Run();
