<script>
  import EpubReader from '$lib/components/EpubReader.svelte';
  let file = null;
  let showReader = false;
  
  function handleFileSelect(event) {
    file = event.target.files[0];
    if (file) {
      showReader = true;
    }
  }
</script>

<main>
  {#if !showReader}
    <div class="upload-container">
      <h1>Lector de EPUB</h1>
      <label class="file-input">
        <input 
          type="file" 
          accept=".epub" 
          on:change={handleFileSelect}
        >
        <span>Seleccionar archivo EPUB</span>
      </label>
    </div>
  {:else}
    <EpubReader {file} />
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

  .file-input {
    background: #4CAF50;
    color: white;
    padding: 1rem 2rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .file-input:hover {
    background: #45a049;
  }

  input[type="file"] {
    display: none;
  }
</style>
