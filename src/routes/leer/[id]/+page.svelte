<script>
  import { page } from '$app/stores';
  import EpubReader from '$lib/components/EpubReader.svelte';
  
  let bookData = null;
  
  async function loadBook() {
    const bookUrl = `https://storage.googleapis.com/datosblog-4095b.appspot.com/libros/${decodeURIComponent($page.params.id)}`;
    const response = await fetch(bookUrl, {
      mode: 'cors' // Intentamos primero con CORS
    });
    bookData = await response.blob();
  }
</script>

{#await loadBook()}
  <div class="loading">Cargando libro...</div>
{:then}
  {#if bookData}
    <EpubReader file={bookData} />
  {/if}
{/await}

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
