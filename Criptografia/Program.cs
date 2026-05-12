using Criptografia.Services;

var builder = WebApplication.CreateBuilder(args);

// Adiciona suporte a Controllers (Necessário para a API funcionar)
builder.Services.AddControllers();

// Configura o Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ativa o Swagger para testes
app.UseSwagger();
app.UseSwaggerUI();

// Redirecionamento HTTPS (opcional para local, mas bom ter)
app.UseHttpsRedirection();

// Importante: Mapeia os Controllers
app.MapControllers();

app.Run();