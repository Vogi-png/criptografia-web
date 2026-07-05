/**
 * ============================================================
 *  UI — Helpers de interface
 *  ----------------------------------------------------------
 *  Funções de baixo nível que manipulam o DOM. Não tem lógica
 *  de negócio — apenas "mostra X na tela", "esconde Y", etc.
 *
 *  Métodos públicos:
 *   • formatBytes()       — formata bytes em KB/MB/GB
 *   • timestamp()         — gera HH:MM:SS atual
 *   • log()               — adiciona linha ao histórico
 *   • clearLog()          — limpa o histórico
 *   • toast()             — exibe notificação temporária
 *   • setApiStatus()      — atualiza pílula de status
 *   • setMode()           — alterna entre Criptografar/Descriptografar
 *   • setDropzoneState()  — alterna entre empty/file/loading
 *   • cycleStages()       — texto cíclico durante processamento
 *   • setExecuteEnabled() — liga/desliga botão de ação
 *   • setActionHint()     — atualiza dica embaixo do botão
 * ============================================================
 */

const UI = {

  /**
   * Converte bytes em string legível.
   * Exemplos: 1024 → "1 KB", 1500000 → "1.43 MB"
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  /** Retorna o horário atual formato HH:MM:SS. */
  timestamp() {
    return new Date().toLocaleTimeString('pt-BR', { hour12: false });
  },

  /**
   * Adiciona uma linha ao histórico (log do painel lateral).
   * @param {string} message
   * @param {'system'|'info'|'success'|'error'} type
   */
  log(message, type = 'system') {
    const body = document.getElementById('logBody');
    if (!body) return;

    const line = document.createElement('div');
    line.className = `log__line log__line--${type}`;
    line.innerHTML = `
      <span class="log__time">${this.timestamp()}</span>
      <span class="log__msg">${this._escape(message)}</span>
    `;
    body.appendChild(line);
    // Faz scroll automático até a última mensagem
    body.scrollTop = body.scrollHeight;
  },

  clearLog() {
    const body = document.getElementById('logBody');
    if (body) body.innerHTML = '';
    this.log('Histórico limpo.', 'system');
  },

  /**
   * Exibe notificação temporária no canto inferior direito.
   * Some sozinha após CONFIG.TOAST_DURATION_MS.
   */
  toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = message;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('is-leaving');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, CONFIG.TOAST_DURATION_MS);
  },

  /**
   * Atualiza o status visual da API no canto superior direito.
   * @param {boolean} online
   */
  setApiStatus(online) {
    const pill = document.getElementById('apiStatus');
    if (!pill) return;

    pill.classList.toggle('is-online', online);
    pill.classList.toggle('is-offline', !online);

    const label = pill.querySelector('.status-pill__label');
    label.textContent = online ? 'Sistema online' : 'Sistema offline';
  },

  /**
   * Atualiza o modo selecionado em toda a UI.
   * Encrypt → âmbar, Decrypt → ciano.
   *
   * Truque: muda apenas o atributo data-mode no <html>.
   * O CSS reage sozinho via seletores [data-mode='...'].
   */
  setMode(mode) {
    document.documentElement.setAttribute('data-mode', mode);

    // Atualiza botões do toggle (aria-checked é importante p/ acessibilidade)
    document.querySelectorAll('.mode-switch__option').forEach((btn) => {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // Painel de informações
    document.getElementById('currentMode').textContent =
      mode === 'encrypt' ? 'Criptografar' : 'Descriptografar';
    document.getElementById('currentFlag').textContent =
      mode === 'encrypt' ? 'false' : 'true';

    // Título principal muda conforme o modo
    document.getElementById('introHeading').textContent =
      mode === 'encrypt'
        ? 'Vamos proteger um arquivo'
        : 'Vamos abrir um arquivo protegido';

    // Descrição do passo 03 adapta o texto
    document.getElementById('step03Description').textContent =
      mode === 'encrypt'
        ? 'Arraste o arquivo que você quer proteger.'
        : 'Arraste o arquivo (enc_...) que você quer abrir.';

    // Label do botão de ação
    document.getElementById('executeLabel').textContent =
      mode === 'encrypt' ? 'Criptografar arquivo' : 'Descriptografar arquivo';
  },

  /**
   * Alterna entre os 3 estados visuais do dropzone.
   * @param {'empty'|'file'|'loading'} state
   */
  setDropzoneState(state) {
    const empty   = document.getElementById('dropzoneEmpty');
    const file    = document.getElementById('dropzoneFile');
    const loading = document.getElementById('dropzoneLoading');

    empty.hidden   = state !== 'empty';
    file.hidden    = state !== 'file';
    loading.hidden = state !== 'loading';
  },

  /**
   * Cicla mensagens de progresso durante o processamento.
   * @returns {Function} função para parar o ciclo
   */
  cycleStages() {
    const el = document.getElementById('loadingStage');
    let i = 0;
    el.textContent = CONFIG.STAGES[0];
    const id = setInterval(() => {
      i = (i + 1) % CONFIG.STAGES.length;
      el.textContent = CONFIG.STAGES[i];
    }, 700);
    return () => clearInterval(id);
  },

  setExecuteEnabled(enabled) {
    document.getElementById('executeBtn').disabled = !enabled;
  },

  setActionHint(text) {
    const hint = document.getElementById('actionHint');
    if (hint) hint.textContent = text;
  },

  // ---------- Privados ----------

  /**
   * Escapa caracteres HTML para não introduzir XSS quando
   * inserimos strings vindas do usuário ou de erros da API.
   */
  _escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },
};

window.UI = UI;
