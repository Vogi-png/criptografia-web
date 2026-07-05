using Criptografia.Services;

var builder = WebApplication.CreateBuilder(args);

// Configura a porta padrão
builder.WebHost.UseUrls("http://localhost:5073");

// Adiciona suporte a Controllers (Necessário para a API funcionar)
builder.Services.AddControllers();

// Habilita CORS para permitir que o frontend (aberto localmente ou via servidor) chame a API.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configura o Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ativa o Swagger para testes
app.UseSwagger();
app.UseSwaggerUI();

// Habilita o CORS antes dos endpoints.
app.UseCors("AllowFrontend");

// Redirecionamento HTTPS (opcional para local, mas bom ter)
app.UseHttpsRedirection();

// Endpoint simples de saúde para o frontend verificar se a API está viva.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Importante: Mapeia os Controllers
app.MapControllers();

app.Run();