<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  const API_KEY = 'AIzaSyBFBbH1SQkSZf1LJzammWAe2karh5mG9rQ';
  const API_URL = 'https://www.googleapis.com/books/v1/volumes';

  let libros = [];
  let busqueda = 'español+epub';
  let loading = false;
  let error = null;
  
  // Pagination variables
  let currentPage = 1;
  let itemsPerPage = 12;
  let totalPages = 0;
  
  $: {
    totalPages = Math.ceil(libros.length / itemsPerPage);
    paginatedBooks = libros.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }

  let paginatedBooks = [];

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
    let todosLosLibros = [];
    
    try {
      // Hacemos 3 llamadas para obtener 120 resultados (40 x 3)
      for(let startIndex = 0; startIndex < 120; startIndex += 40) {
        const params = {
          q: busqueda,
          filter: 'free-ebooks',
          printType: 'books',
          langRestrict: 'es',
          maxResults: 40,
          startIndex: startIndex
        };

        const response = await fetch(`${API_URL}?key=${API_KEY}&${new URLSearchParams(params)}`);
        if (!response.ok) throw new Error('Error en la búsqueda');
        
        const data = await response.json();
        if (data.items) {
          todosLosLibros = [...todosLosLibros, ...data.items];
        }
      }
      
      libros = todosLosLibros.filter(libro => libro.accessInfo?.epub?.downloadLink);
    } catch (error) {
      console.error('Error:', error);
      error = 'Error al buscar libros';
    } finally {
      loading = false;
    }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    scrollToTop();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    scrollToTop();
  }
}
  // Añade estas sugerencias
  const sugerencias = [
    "novelas clásicas",
    "ciencia ficción",
    "poesía",
    "historia",
    "filosofía",
    "aventuras",
    "cuentos"
  ];

  function aplicarSugerencia(sugerencia) {
    busqueda = sugerencia;
    buscar();
  }
  async function mostrarContenido(libro) {
    try {
      const downloadLink = libro.accessInfo?.epub?.downloadLink;
      console.log('Link EPUB:', downloadLink);
      
      if (downloadLink) {
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

<div class="search-container">
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
</div>
<div class="sugerencias">
  {#each sugerencias as sugerencia}
    <button 
      class="sugerencia-tag"
      on:click={() => aplicarSugerencia(sugerencia)}
    >
      {sugerencia}
    </button>
  {/each}
</div>
{#if error}
  <p class="error">{error}</p>
{/if}

{#if loading}
  <p class="loading">Cargando libros...</p>
{:else}
<ul>
  {#each paginatedBooks as libro}
    {#if libro.volumeInfo && libro.volumeInfo.authors}
      <li>
        <h2>{libro.volumeInfo.title}</h2>
        <p class="authors">{libro.volumeInfo.authors.join(', ')}</p>
        {#if libro.volumeInfo.description}
          <p class="descripcion">{libro.volumeInfo.description.slice(0, 150)}...</p>
        {/if}
        
        <!-- Información adicional -->
        {#if libro.volumeInfo.pageCount}
          <p class="info">Páginas: {libro.volumeInfo.pageCount}</p>
        {/if}
        
        {#if libro.volumeInfo.publishedDate}
          <p class="info">Publicado: {libro.volumeInfo.publishedDate}</p>
        {/if}
        
        <!-- Botones de acción -->
        <div class="button-container">
          <button class="icon-btn download-btn" title="Descargar EPUB" on:click={() => mostrarContenido(libro)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          {#if libro.volumeInfo.previewLink}
            <button class="icon-btn preview-btn" title="Vista previa" on:click={() => window.open(libro.volumeInfo.previewLink, '_blank')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          {/if}
        </div>
      </li>
    {/if}
  {/each}
</ul>


  <div class="pagination">
    <button 
      class="pagination-btn" 
      on:click={prevPage} 
      disabled={currentPage === 1}
    >
      Anterior
    </button>
    <span class="page-info">Página {currentPage} de {totalPages}</span>
    <button 
      class="pagination-btn" 
      on:click={nextPage} 
      disabled={currentPage === totalPages}
    >
      Siguiente
    </button>
  </div>
{/if}

<style>
  :root {
    --primary-color: #1a1a1a;
    --secondary-color: #333333;
    --accent-color: #4a4a4a;
    --text-color: #ffffff;
    --border-color: #2a2a2a;
  }

  h1 {
    text-align: center;
    margin: 2rem 0;
    color: var(--primary-color);
  }

  .search-container {
    max-width: 600px;
    margin: 0 auto 2rem;
  }

  form {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  input[type="search"] {
    flex: 1;
    height: 40px;
    font-size: 16px;
    padding: 0 1rem;
    border: 2px solid var(--border-color);
    border-radius: 5px;
    background-color: #ffffff;
  }

  button {
    height: 40px;
    padding: 0 1.5rem;
    font-size: 16px;
    background-color: var(--primary-color);
    color: var(--text-color);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: var(--secondary-color);
  }

  button:disabled {
    background-color: var(--accent-color);
    cursor: not-allowed;
  }

  ul {
    list-style-type: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
  }

  li {
    background-color: #ffffff;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s;
  }

  li:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin: 2rem 0;
  }

  .pagination-btn {
    padding: 0.5rem 1rem;
    background-color: var(--primary-color);
  }

  .page-info {
    color: var(--primary-color);
    font-size: 0.9rem;
  }

  .download-btn {
    width: 100%;
    margin-top: 1rem;
  }

  .authors {
    font-style: italic;
    color: var(--accent-color);
  }

  .descripcion {
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--secondary-color);
  }
  .button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-top: 15px;
  }
  .icon-btn {
    width: 40px;
    height: 40px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .icon-btn:hover {
    transform: scale(1.1);
  }

  .icon-btn svg {
    color: white;
  }

  .download-btn {
    background-color: #1a1a1a;
  }

  .preview-btn {
    background-color: #333;
  }

  .info {
    font-size: 14px;
    color: #666;
    margin: 5px 0;
  }

  .preview-btn {
    background-color: #333;
  }
  .sugerencias {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
  }

  .sugerencia-tag {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .sugerencia-tag:hover {
    background-color: #333;
    color: white;
  }
</style>
