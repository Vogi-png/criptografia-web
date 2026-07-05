using Microsoft.AspNetCore.Mvc;
using Criptografia.Services;
using System.IO;
using System.Text;

namespace Criptografia.Controllers {

    // Controller que expõe a API para criptografar e descriptografar arquivos
    [ApiController]
    [Route("api/[controller]")]
    public class CriptoController : ControllerBase {

        private readonly Feistel _feistelService;

        // Injeta o serviço de Feistel para processar os bytes do arquivo
        public CriptoController() {
            _feistelService = new Feistel();
        }

        // Endpoint que recebe um arquivo e uma chave, e retorna o arquivo criptografado ou descriptografado
        [HttpPost("processar")]
        [Consumes("multipart/form-data")]
        public IActionResult ProcessarArquivo(IFormFile arquivo, [FromForm] string chave, [FromForm] bool descriptografar = false) {
            
            if (arquivo == null || arquivo.Length == 0)
                return BadRequest("Arquivo não selecionado.");

            // Tamanho da chave de 32 bits (4 bytes)
            if (string.IsNullOrEmpty(chave) || chave.Length < 4)
                return BadRequest("A chave precisa ter pelo menos 4 caracteres para formar 32 bits.");

            // Deriva 4 bytes a partir da string fornecida para formar uma chave de 32 bits.
            byte[] chaveBytes = new byte[4];
            byte[] bytesChave = Encoding.UTF8.GetBytes(chave);
            for (int i = 0; i < 4; i++) {
                int indice = i % bytesChave.Length;
                chaveBytes[i] = (byte)(bytesChave[indice] ^ (byte)(i * 31 + bytesChave.Length));
            }

            using var ms = new MemoryStream();
            arquivo.CopyTo(ms);
            byte[] bytesOriginais = ms.ToArray();

            // Passa a flag 'descriptografar' para o serviço inverter a ordem das chaves
            byte[] bytesProcessados = _feistelService.Processar(bytesOriginais, chaveBytes, descriptografar);

            // Gera o nome do arquivo de saída com prefixo indicando a operação realizada.
            string nomeOriginal = arquivo.FileName;
            string novoNome = descriptografar ? $"decrypt_{nomeOriginal}" : $"encrypt_{nomeOriginal}";

            // Retorna o arquivo com o sufixo para indicar o que foi feito
            return File(bytesProcessados, "application/octet-stream", novoNome);
        }
    }
}