<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  const API_KEY = 'AIzaSyBFBbH1SQkSZf1LJzammWAe2karh5mG9rQ';
  const API_URL = 'https://www.googleapis.com/books/v1/volumes';

  let libros = [];
  let busqueda = 'español+epub';
  let loading = false;
  let error = null;
  let iframeLoading = false;

  onMount(async () => {
    loading = true;
    try {
      await buscar();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });

  async function buscar() {
    loading = true;
    error = null;
    
    try {
      const params = {
        q: busqueda,
        filter: 'free-ebooks',
        printType: 'books',
        langRestrict: 'es',
        maxResults: 40
      };

      const response = await fetch(`${API_URL}?key=${API_KEY}&${new URLSearchParams(params)}`);
      if (!response.ok) throw new Error('Error en la búsqueda');
      
      const data = await response.json();
      libros = (data.items || []).filter(libro => libro.accessInfo?.epub?.downloadLink);
    } catch (error) {
      console.error('Error:', error);
      error = 'Error al buscar libros';
    } finally {
      loading = false;
    }
  }

  async function mostrarContenido(libro) {
  try {
    const downloadLink = libro.accessInfo?.epub?.downloadLink;
    console.log('Link EPUB:', downloadLink);
    
    if (downloadLink) {
      // Abrimos directamente en nueva pestaña
      const newTab = window.open(downloadLink, '_blank');
      if (newTab) {
        newTab.focus();
      } else {
        alert('Tu navegador bloqueó la apertura de la pestaña. Por favor, permite las ventanas emergentes para este sitio.');
      }
    } else {
      alert('Versión EPUB no disponible para este libro');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al acceder al libro');
  }
}


</script>

<h1>Libros en español en formato EPUB</h1>

<form on:submit|preventDefault={buscar}>
  <input 
    type="search" 
    bind:value={busqueda} 
    placeholder="Buscar libros..." 
    disabled={loading}
  >
  <button type="submit" disabled={loading}>
    {loading ? 'Buscando...' : 'Buscar'}
  </button>
</form>

{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p class="loading">Cargando libros...</p>
{:else}
  <ul>
    {#each libros as libro}
      {#if libro.volumeInfo && libro.volumeInfo.authors}
      <li>
        <h2>{libro.volumeInfo.title}</h2>
        <p>{libro.volumeInfo.authors.join(', ')}</p>
        {#if libro.volumeInfo.description}
          <p class="descripcion">{libro.volumeInfo.description.slice(0, 150)}...</p>
        {/if}
        <button on:click={() => mostrarContenido(libro)}>
          Descargar en nueva pestaña
        </button>
      </li>
      
      {/if}
    {/each}
  </ul>
{/if}

<style>
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  form {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  input[type="search"] {
    width: 50%;
    height: 40px;
    font-size: 16px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  button {
    height: 40px;
    font-size: 16px;
    background-color: #4CAF50;
    color: #fff;
    padding: 0 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    background-color: #3e8e41;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  li {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: transform 0.2s;
  }

  li:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  p {
    font-size: 16px;
    color: #666;
    margin-bottom: 15px;
  }

  .error {
    color: red;
    text-align: center;
    margin: 20px 0;
  }

  .loading {
    text-align: center;
    color: #666;
  }
</style>
