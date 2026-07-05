/**
 * ============================================================
 *  KEY FIELD — Componente do campo de senha
 *  ----------------------------------------------------------
 *  Encapsula tudo relacionado ao campo de senha:
 *   • leitura do valor digitado
 *   • validação de tamanho mínimo (4 caracteres, exigência do backend)
 *   • contador de caracteres em tempo real
 *   • toggle de visibilidade (olho aberto/fechado)
 *   • callback de mudança (notifica quem está observando)
 *
 *  Padrão de design: o componente NÃO sabe quem o observa.
 *  Ele aceita um callback no init() e o chama quando o
 *  valor muda. O orquestrador (main.js) é quem decide o que
 *  fazer com essa notificação. Isso é "inversão de dependência"
 *  e desacopla os componentes uns dos outros.
 * ============================================================
 */

const KeyField = {

  els: {},
  _onChangeCallback: null,

  /**
   * @param {Function} [onChange] — callback disparado quando o valor muda
   */
  init(onChange) {
    this.els = {
      input:    document.getElementById('keyInput'),
      toggle:   document.getElementById('keyToggle'),
      meta:     document.getElementById('keyMeta'),
      eyeIcon:  document.getElementById('keyEyeIcon'),
    };

    this._onChangeCallback = onChange || null;
    this._bindEvents();
    this._updateMeta();
  },

  /** Retorna a senha digitada (string). */
  getKey() {
    return this.els.input.value;
  },

  /** Verifica se a senha atende ao tamanho mínimo definido em CONFIG. */
  isValid() {
    return this.getKey().length >= CONFIG.MIN_KEY_LENGTH;
  },

  /** Limpa o campo. */
  clear() {
    this.els.input.value = '';
    this._updateMeta();
    if (this._onChangeCallback) this._onChangeCallback();
  },

  /** Move o foco para o campo (chamado quando o usuário tenta executar sem senha). */
  focus() {
    this.els.input.focus();
  },

  // ---------- Privados ----------

  _bindEvents() {
    // Cada tecla pressionada → atualiza contador + notifica orquestrador
    this.els.input.addEventListener('input', () => {
      this._updateMeta();
      if (this._onChangeCallback) this._onChangeCallback();
    });
    this.els.toggle.addEventListener('click', () => this._toggleVisibility());
  },

  _updateMeta() {
    const len = this.getKey().length;
    const palavra = len === 1 ? 'caractere' : 'caracteres';
    this.els.meta.textContent = `${len} ${palavra}`;
  },

  /**
   * Alterna entre senha oculta (•••) e senha visível.
   * Também troca o ícone do olho (aberto ↔ riscado).
   */
  _toggleVisibility() {
    const isPassword = this.els.input.type === 'password';
    this.els.input.type = isPassword ? 'text' : 'password';

    // Troca o conteúdo do SVG do olho.
    this.els.eyeIcon.innerHTML = isPassword
      ? '<path d="M2 2 L14 14" /><path d="M1.5 8 C 3.5 4 6 3 8 3 C 10 3 12.5 4 14.5 8 C 12.5 12 10 13 8 13 C 6 13 3.5 12 1.5 8 Z" /><circle cx="8" cy="8" r="2" />'
      : '<path d="M1.5 8 C 3.5 4 6 3 8 3 C 10 3 12.5 4 14.5 8 C 12.5 12 10 13 8 13 C 6 13 3.5 12 1.5 8 Z" /><circle cx="8" cy="8" r="2" />';
  },
};

window.KeyField = KeyField;
