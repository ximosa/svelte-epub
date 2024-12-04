<script>
  import EpubReader from '$lib/components/EpubReader.svelte';
  let file = null;
  let showReader = false;
  let epubUrl = '';
  let loading = false;

  async function handleFileSelect(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/epub+zip') {
      file = selectedFile;
      epubUrl = '';
      showReader = true;
    }
  }

  async function handleUrlSubmit() {
    if (epubUrl) {
      loading = true;
      try {
        const proxyUrl = '/api/books/download?url=' + encodeURIComponent(epubUrl);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error('Error al descargar el archivo');
        }
        
        const blob = await response.blob();
        const fileName = epubUrl.split('/').pop() || 'libro.epub';
        
        file = new File([blob], fileName, {
          type: 'application/epub+zip'
        });
        showReader = true;
      } catch (error) {
        console.log('Error al cargar el EPUB:', error);
      } finally {
        loading = false;
      }
    }
  }
</script>

<main>
  {#if !showReader}
    <div class="upload-container">
      <div class="header">
        <h1>Lector de EPUB</h1>
        <p class="subtitle">Lee tus libros digitales de forma fácil y rápida</p>
      </div>

      <div class="input-group">
        <div class="section">
          <h2>Desde tu dispositivo</h2>
          <label class="file-input">
            <input
              type="file"
              accept="application/epub+zip"
              on:change={handleFileSelect}
            >
            <span>📚 Seleccionar archivo EPUB</span>
          </label>
        </div>

        <div class="divider">o</div>

        <div class="section">
          <h2>Desde una URL</h2>
          <div class="url-input-container">
            <input
              type="url"
              bind:value={epubUrl}
              placeholder="https://ejemplo.com/libro.epub"
              class="url-input"
              disabled={loading}
            >
            <button
              class="url-button"
              on:click={handleUrlSubmit}
              disabled={loading}
            >
              {loading ? '⌛' : '🔗'} {loading ? 'Cargando...' : 'Cargar URL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else if file}
    <EpubReader url={epubUrl} {file} />
  {/if}
</main>

<style>
  .upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    gap: 3rem;
    background: #f5f5f5;
  }

  .header {
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #666;
    font-size: 1.1rem;
  }

  .input-group {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 500px;
  }

  .section {
    margin-bottom: 1.5rem;
  }

  h2 {
    font-size: 1.2rem;
    color: #444;
    margin-bottom: 1rem;
  }

  .divider {
    text-align: center;
    color: #666;
    margin: 1.5rem 0;
    position: relative;
  }

  .divider::before,
  .divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 45%;
    height: 1px;
    background: #ddd;
  }

  .divider::before { left: 0; }
  .divider::after { right: 0; }

  .file-input {
    background: #4CAF50;
    color: white;
    padding: 1rem 2rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    display: block;
    font-weight: 500;
  }

  .file-input:hover {
    background: #45a049;
    transform: translateY(-2px);
  }

  input[type="file"] {
    display: none;
  }

  .url-input-container {
    display: flex;
    gap: 0.5rem;
  }

  .url-input {
    flex: 1;
    padding: 0.8rem;
    border: 2px solid #eee;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s;
  }

  .url-input:focus {
    border-color: #2196F3;
    outline: none;
  }

  .url-button {
    background: #2196F3;
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
    min-width: 120px;
  }

  .url-button:hover:not(:disabled) {
    background: #1976D2;
    transform: translateY(-2px);
  }

  .url-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
</style>

