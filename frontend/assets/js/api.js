/**
 * ============================================================
 *  API — Camada de comunicação com o backend .NET
 *  ----------------------------------------------------------
 *  Toda chamada HTTP do app passa por este arquivo. Isso é
 *  importante porque:
 *
 *   1. SE A API MUDAR, mexemos só aqui (e no config.js).
 *   2. PODEMOS TROCAR fetch por axios sem afetar o resto.
 *   3. ERROS são tratados em um único lugar.
 *   4. O resto do código (main.js) fica só com lógica de UI.
 *
 *  Esse padrão é chamado de "service layer" e é considerado
 *  boa prática em qualquer aplicação que consome APIs.
 * ============================================================
 */

const API = {

  /**
   * Verifica se a API está respondendo.
   * Usado ao carregar a página, para mostrar 🟢 ou 🔴 no topo.
   *
   * Como o backend não tem um endpoint de "health", tentamos
   * acessar a raiz da API. Qualquer resposta (mesmo 404)
   * significa que o servidor está vivo. Apenas um erro de
   * REDE (servidor caído, porta errada) faz cair no catch.
   *
   * @returns {Promise<boolean>} true se o servidor está respondendo
   */
  async checkHealth() {
    try {
      const url = CONFIG.API_BASE + '/health';
      const response = await fetch(url, { method: 'GET' });
      return response.ok;
    } catch (err) {
      // Erro de rede / CORS / servidor desligado → offline
      return false;
    }
  },

  /**
   * Envia o arquivo + chave + flag para o backend processar.
   *
   * O backend espera multipart/form-data (não JSON), porque
   * estamos enviando um arquivo binário. JSON não comporta
   * binários nativamente — teríamos que codificar em base64,
   * o que aumentaria o tamanho em ~33%.
   *
   * @param {File}    file     — o arquivo escolhido pelo usuário
   * @param {string}  key      — senha digitada (≥ 4 caracteres)
   * @param {boolean} decrypt  — true = descriptografar
   * @returns {Promise<{blob: Blob, filename: string}>}
   * @throws {Error} se o backend retornar status != 2xx
   */
  async processFile(file, key, decrypt) {
    // FormData é a API nativa do navegador para construir
    // requests multipart. Adicionando campos via .append(),
    // o navegador monta os boundaries e headers corretos.
    const formData = new FormData();
    formData.append(CONFIG.FORM_FIELD_FILE, file);
    formData.append(CONFIG.FORM_FIELD_KEY,  key);
    // String(boolean) → "true" ou "false" (texto).
    // O ASP.NET converte essa string em bool no [FromForm].
    formData.append(CONFIG.FORM_FIELD_FLAG, String(decrypt));

    const url = CONFIG.API_BASE + CONFIG.ENDPOINTS.process;

    // NÃO precisa definir Content-Type manualmente:
    // ao passar FormData como body, o fetch escolhe o
    // Content-Type correto (multipart/form-data; boundary=...).
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // response.ok = true se o status estiver em 200-299
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}`;
      try {
        // Tenta ler o corpo do erro (geralmente texto puro)
        const errorBody = await response.text();
        if (errorBody) errorMessage += ` — ${errorBody.substring(0, 200)}`;
      } catch (_) {
        // Se não der pra ler, segue só com o status
      }
      throw new Error(errorMessage);
    }

    // Lê o nome do arquivo que o backend definiu (vem no header
    // Content-Disposition). Ex: "attachment; filename=enc_teste.txt"
    const filename = this._extractFilename(
      response.headers.get('Content-Disposition'),
      file.name,
      decrypt
    );

    // .blob() lê o corpo da resposta como dado binário (Blob).
    const blob = await response.blob();

    return { blob, filename };
  },

  /**
   * Dispara o download de um Blob como arquivo no navegador.
   *
   * Não existe API direta de "salvar arquivo" no browser por
   * questão de segurança. O truque clássico:
   *   1. Criar URL local apontando para o Blob
   *   2. Criar <a> invisível com download="nome.ext"
   *   3. Simular clique no <a>
   *   4. Limpar tudo (revoke da URL temporária)
   *
   * @param {Blob}   blob      — dado binário a ser baixado
   * @param {string} filename  — nome que aparece no diálogo de download
   */
  downloadBlob(blob, filename) {
    // Cria uma URL local "blob:http://..." válida só nesta aba.
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // IMPORTANTE: libera a URL temporária da memória.
    URL.revokeObjectURL(url);
  },

  // ---------- Privados ----------

  /**
   * Extrai o nome do arquivo do header Content-Disposition.
   * Se não conseguir extrair, usa um fallback baseado no
   * arquivo original e no modo (prefixo enc_ ou dec_).
   *
   * Exemplo de header esperado:
   *   "attachment; filename=enc_teste.txt"
   */
  _extractFilename(disposition, originalName, decrypted) {
    if (disposition) {
      // Tenta capturar o filename do header.
      const match = /filename\*?=(?:UTF-8'')?["']?([^;"'\r\n]+)["']?/i.exec(disposition);
      if (match && match[1]) {
        return decodeURIComponent(match[1].trim());
      }
    }
    // Fallback: monta o nome com o mesmo padrão do backend
    // (prefixo enc_ ou dec_).
    const prefixo = decrypted ? 'dec_' : 'enc_';
    return prefixo + originalName;
  },
};

window.API = API;
