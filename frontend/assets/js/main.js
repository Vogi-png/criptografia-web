/**
 * ============================================================
 *  MAIN — Orquestrador da aplicação
 *  ----------------------------------------------------------
 *  Este é o "maestro": ele inicializa os componentes
 *  (Dropzone, KeyField), conecta os event listeners e
 *  coordena o fluxo de execução.
 *
 *  Padrão usado: cada componente expõe uma API pública
 *  (init, getValue, isValid, etc) e o orquestrador apenas
 *  consome essas APIs. Isso mantém os componentes independentes.
 *
 *  Fluxo principal:
 *    1. Página carrega → App.init()
 *    2. Componentes registram callbacks para notificar mudanças
 *    3. Cada mudança chama _updateActionState(), que decide
 *       se o botão "Executar" deve estar habilitado
 *    4. Quando o usuário clica em Executar → App.execute()
 *    5. execute() chama API.processFile() e baixa o resultado
 * ============================================================
 */

const App = {

  // Modo atual: 'encrypt' (criptografar) ou 'decrypt' (descriptografar)
  currentMode: 'encrypt',

  async init() {
    // Inicializa componentes — cada um avisa quando muda
    Dropzone.init(() => this._updateActionState());
    KeyField.init(() => this._updateActionState());

    this._bindModeSwitch();
    this._bindExecuteButton();
    this._bindClearLog();
    this._bindKeyboardShortcuts();

    // Define modo inicial (encrypt)
    UI.setMode(this.currentMode);
    this._updateActionState();

    // Verifica se o backend está respondendo
    UI.log('Verificando conexão com o servidor…', 'system');
    const online = await API.checkHealth();
    UI.setApiStatus(online);
    UI.log(
      online
        ? 'Conexão estabelecida. Pronto para começar.'
        : 'Servidor não respondeu. Verifique se o backend está rodando.',
      online ? 'success' : 'error'
    );
  },

  // ---------- Bindings ----------

  _bindModeSwitch() {
    document.querySelectorAll('.mode-switch__option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode === this.currentMode) return;
        this.currentMode = mode;
        UI.setMode(mode);
        this._updateActionState();

        UI.log(
          mode === 'encrypt'
            ? 'Modo: Criptografar (transformar em código secreto).'
            : 'Modo: Descriptografar (recuperar conteúdo original).',
          'info'
        );
      });
    });
  },

  _bindExecuteButton() {
    document.getElementById('executeBtn').addEventListener('click', () => {
      this.execute();
    });
  },

  _bindClearLog() {
    document.getElementById('clearLog').addEventListener('click', () => {
      UI.clearLog();
    });
  },

  /**
   * Atalho de teclado: Enter executa (quando o foco não está
   * em um input). Permite usar a app só com teclado.
   */
  _bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'Enter' &&
        !e.target.matches('input, textarea, button') &&
        !document.getElementById('executeBtn').disabled
      ) {
        e.preventDefault();
        this.execute();
      }
    });
  },

  /**
   * Verifica se os 3 passos estão completos e atualiza:
   *  • o estado (habilitado/desabilitado) do botão de ação
   *  • a dica embaixo do botão (diz exatamente o que falta)
   *
   * Chamado toda vez que o KeyField ou o Dropzone mudam.
   */
  _updateActionState() {
    const hasKey  = KeyField.isValid();
    const hasFile = Dropzone.hasFile();

    UI.setExecuteEnabled(hasKey && hasFile);

    if (!hasKey && !hasFile) {
      UI.setActionHint('Complete os passos 02 e 03 para liberar o botão.');
    } else if (!hasKey) {
      UI.setActionHint(`Faltou a senha (mínimo ${CONFIG.MIN_KEY_LENGTH} caracteres).`);
    } else if (!hasFile) {
      UI.setActionHint('Falta enviar um arquivo no passo 03.');
    } else {
      UI.setActionHint('Tudo certo. Pressione o botão ou aperte Enter.');
    }
  },

  // ---------- Fluxo principal ----------

  /**
   * Executa o fluxo completo: envia para a API e baixa o resultado.
   * Atualiza visualmente os estados (loading, file, etc) e o histórico.
   */
  async execute() {
    // Validações
    const file = Dropzone.getFile();
    if (!file) {
      UI.toast('Selecione um arquivo primeiro.', 'error');
      return;
    }

    if (!KeyField.isValid()) {
      UI.toast(`A senha precisa ter ao menos ${CONFIG.MIN_KEY_LENGTH} caracteres.`, 'error');
      KeyField.focus();
      return;
    }

    const key = KeyField.getKey();
    const decrypt = this.currentMode === 'decrypt';
    const verbo = decrypt ? 'descriptografar' : 'criptografar';
    const verboFeito = decrypt ? 'descriptografado' : 'criptografado';

    // Entra em modo "processando"
    UI.setDropzoneState('loading');
    UI.setExecuteEnabled(false);
    const stopStages = UI.cycleStages();

    UI.log(`Enviando "${file.name}" para ${verbo}…`, 'info');

    try {
      // Chama o backend
      const { blob, filename } = await API.processFile(file, key, decrypt);

      // Dispara o download no navegador
      API.downloadBlob(blob, filename);

      UI.toast(`Arquivo ${verboFeito} com sucesso.`, 'success');
      UI.log(`Download: ${filename} (${UI.formatBytes(blob.size)}).`, 'success');

      // Volta ao estado "arquivo selecionado" (usuário pode operar de novo)
      UI.setDropzoneState('file');
      this._updateActionState();
    } catch (err) {
      UI.toast(`Não foi possível ${verbo} o arquivo.`, 'error');
      UI.log(`Erro: ${err.message}`, 'error');
      UI.setDropzoneState('file');
      this._updateActionState();
    } finally {
      // Para o ciclo de textos do "processando"
      stopStages();
    }
  },
};

// Inicia o App quando o DOM estiver pronto.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

window.App = App;
