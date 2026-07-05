/**
 * ============================================================
 *  DROPZONE — Componente de drag & drop de arquivos
 *  ----------------------------------------------------------
 *  Atende três formas do usuário escolher um arquivo:
 *   1. Arrastando para a zona
 *   2. Clicando na zona (abre o seletor)
 *   3. Clicando no botão "Escolher do computador"
 *
 *  Eventos de drag & drop nativos do HTML5:
 *   • dragenter/dragover → arquivo entra na zona (adiciona estilo)
 *   • dragleave          → arquivo sai da zona (remove estilo)
 *   • drop               → arquivo foi solto (captura o arquivo)
 *
 *  preventDefault() é OBRIGATÓRIO em dragover, senão o
 *  navegador trata como "navegar para o arquivo" e abre
 *  o arquivo em vez de notificar o JS.
 *
 *  Igual ao KeyField, este componente notifica mudanças
 *  via callback registrado no init().
 * ============================================================
 */

const Dropzone = {

  selectedFile: null,
  els: {},
  _onChangeCallback: null,

  init(onChange) {
    this.els = {
      zone:       document.getElementById('dropzone'),
      input:      document.getElementById('fileInput'),
      browseBtn:  document.getElementById('browseBtn'),
      removeBtn:  document.getElementById('removeFile'),
      fileName:   document.getElementById('fileName'),
      fileMeta:   document.getElementById('fileMeta'),
    };

    this._onChangeCallback = onChange || null;
    this._bindEvents();
  },

  /** Retorna o arquivo selecionado, ou null se nenhum. */
  getFile() {
    return this.selectedFile;
  },

  /** Indica se há um arquivo carregado. */
  hasFile() {
    return this.selectedFile !== null;
  },

  /** Remove o arquivo atual e volta ao estado "vazio". */
  clear() {
    this.selectedFile = null;
    this.els.input.value = '';
    UI.setDropzoneState('empty');
    if (this._onChangeCallback) this._onChangeCallback();
  },

  setFile(file) {
    this._handleFile(file);
  },

  // ---------- Privados ----------

  _bindEvents() {
    const { zone, input, browseBtn, removeBtn } = this.els;

    // Botão "Escolher do computador" abre o seletor nativo.
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();  // evita bubbling para o clique na zona
      input.click();
    });

    // Clicar na zona também abre o seletor.
    zone.addEventListener('click', () => input.click());

    // Acessibilidade: Enter/Espaço quando a zona está focada.
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    // Quando o usuário escolhe via seletor nativo.
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) this._handleFile(file);
    });

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.clear();
      UI.log('Arquivo removido.', 'system');
    });

    // ----- Drag & Drop -----
    // dragenter/dragover: arquivo está sobre a zona
    ['dragenter', 'dragover'].forEach((evt) => {
      zone.addEventListener(evt, (e) => {
        e.preventDefault();   // ESSENCIAL: sem isso o drop não funciona
        e.stopPropagation();
        zone.classList.add('is-dragging');
      });
    });

    // dragleave/drop: arquivo saiu da zona ou foi solto
    ['dragleave', 'drop'].forEach((evt) => {
      zone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('is-dragging');
      });
    });

    // Drop: pega o arquivo do DataTransfer
    zone.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) this._handleFile(file);
    });
  },

  _handleFile(file) {
    // Validação de tamanho (limite configurável em CONFIG)
    const maxBytes = CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      UI.toast(
        `O arquivo é muito grande. Limite: ${CONFIG.MAX_FILE_SIZE_MB} MB`,
        'error'
      );
      UI.log(`Arquivo recusado: ${UI.formatBytes(file.size)} acima do limite.`, 'error');
      return;
    }

    this.selectedFile = file;

    // Atualiza UI com info do arquivo
    this.els.fileName.textContent = file.name;
    this.els.fileMeta.textContent =
      `${UI.formatBytes(file.size)} · ${file.type || 'tipo desconhecido'}`;

    UI.setDropzoneState('file');
    UI.log(`Arquivo carregado: ${file.name} (${UI.formatBytes(file.size)}).`, 'info');

    if (this._onChangeCallback) this._onChangeCallback();
  },
};

window.Dropzone = Dropzone;
