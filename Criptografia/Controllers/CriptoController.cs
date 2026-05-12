using Microsoft.AspNetCore.Mvc;
using Criptografia.Services;
using System.IO;

namespace Criptografia.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CriptoController : ControllerBase
    {
        private readonly Feistel _feistelService;

        public CriptoController()
        {
            _feistelService = new Feistel();
        }

        [HttpPost("processar")]
        [Consumes("multipart/form-data")]
        public IActionResult ProcessarArquivo(IFormFile arquivo, [FromForm] string chave, [FromForm] bool descriptografar = false)
        {
            if (arquivo == null || arquivo.Length == 0)
                return BadRequest("Arquivo não selecionado.");

            // Requisito: Tamanho da chave de 32 bits (4 bytes/caracteres)
            if (string.IsNullOrEmpty(chave) || chave.Length < 4)
                return BadRequest("A chave precisa ter pelo menos 4 caracteres para formar 32 bits.");

            // Pega apenas os primeiros 4 caracteres da string fornecida pelo usuário
            byte[] chaveBytes = System.Text.Encoding.UTF8.GetBytes(chave.Substring(0, 4));

            using var ms = new MemoryStream();
            arquivo.CopyTo(ms);
            byte[] bytesOriginais = ms.ToArray();

            // Passa a flag 'descriptografar' para o serviço inverter a ordem das chaves
            byte[] bytesProcessados = _feistelService.Processar(bytesOriginais, chaveBytes, descriptografar);

            string nomeOriginal = arquivo.FileName;
            // Retorna o arquivo com o sufixo para indicar o que foi feito
            string novoNome = descriptografar ? $"dec_{nomeOriginal}" : $"enc_{nomeOriginal}";

            return File(bytesProcessados, "application/octet-stream", novoNome);
        }
    }
}