/**
 * ============================================================
 *  CONFIG — Configurações centralizadas da aplicação
 *  ----------------------------------------------------------
 *  Mantemos TODAS as URLs, nomes de campo e limites em um
 *  único arquivo. Se a API mudar de porta, basta alterar
 *  aqui que o resto do app se adapta sozinho.
 *
 *  Padrão chamado "single source of truth": uma única fonte
 *  da verdade para configurações.
 * ============================================================
 */

const CONFIG = {
  // URL onde o backend .NET está rodando.
  // Por padrão, o ASP.NET Core sobe na porta 5073 (definida no
  // arquivo backend/Properties/launchSettings.json).
  // Se aparecer outra porta no terminal do backend, troque aqui.
  API_BASE: 'http://localhost:5073',

  // Endpoints disponíveis na API.
  // Estes valores precisam bater EXATAMENTE com as rotas
  // dos Controllers no backend (em backend/Controllers/).
  ENDPOINTS: {
    // POST: recebe arquivo + chave + flag, devolve arquivo processado
    process: '/api/Cripto/processar',
  },

  // Nomes dos campos do formulário (multipart/form-data).
  // Devem bater com os parâmetros [FromForm] do CriptoController.cs.
  FORM_FIELD_FILE: 'arquivo',
  FORM_FIELD_KEY:  'chave',
  FORM_FIELD_FLAG: 'descriptografar',  // ATENÇÃO: com S (deScriptografar)

  // Validações feitas no front antes de chamar a API.
  // Economiza uma ida ao servidor quando o usuário esquece algo.
  MAX_FILE_SIZE_MB: 50,
  MIN_KEY_LENGTH:   4,  // o backend exige no mínimo 4 caracteres

  // Tempo que um toast permanece visível (em milissegundos).
  TOAST_DURATION_MS: 3800,

  // Textos que ciclam no rodapé enquanto a operação acontece.
  // Puramente cosmético — o backend não reporta progresso real,
  // então estes textos só dão a sensação de "algo acontecendo".
  STAGES: [
    'Lendo o arquivo',
    'Preparando a chave',
    'Empacotando o resultado',
  ],
};

// Expõe o objeto globalmente para os outros arquivos consumirem
// sem precisar de import/export (manter simples, sem build step).
window.CONFIG = CONFIG;