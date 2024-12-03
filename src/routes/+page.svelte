<script>
  import EpubReader from '$lib/components/EpubReader.svelte';
  let file = null;
  let showReader = false;
  let epubUrl = '';

  async function handleFileSelect(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/epub+zip') {
      file = selectedFile;
      epubUrl = '';  // Limpiamos la URL si existe
      showReader = true;
    }
  }

  async function handleUrlSubmit() {
    if (epubUrl) {
        try {
            // Usamos nuestro propio endpoint como proxy
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
        }
    }
}




</script>

<main>
  {#if !showReader}
    <div class="upload-container">
      <h1>Lector de EPUB</h1>
      <div class="input-group">
        <label class="file-input">
          <input 
            type="file" 
            accept="application/epub+zip"
            on:change={handleFileSelect}
          >
          <span>Seleccionar archivo EPUB</span>
        </label>
        
        <div class="url-input-container">
          <input 
            type="url" 
            bind:value={epubUrl}
            placeholder="Ingrese URL del EPUB"
            class="url-input"
          >
          <button 
            class="url-button"
            on:click={handleUrlSubmit}
          >
            Cargar URL
          </button>
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
    height: 100vh;
    gap: 2rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
  }

  .file-input {
    background: #4CAF50;
    color: white;
    padding: 1rem 2rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
    text-align: center;
    display: block;
  }

  .file-input:hover {
    background: #45a049;
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
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .url-button {
    background: #2196F3;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .url-button:hover {
    background: #1976D2;
  }
</style>
