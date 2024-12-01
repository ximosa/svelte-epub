<script>
  import { onMount } from 'svelte';
  import EpubReader from '$lib/components/EpubReader.svelte';

  let searchQuery = '';
  let searchResults = [];
  let loading = false;
  let file = null;
  let mostrarLector = false;

  // Añadimos logs para rastrear el flujo
  onMount(() => {
      console.log('Componente montado');
  });

  function buscarLibros() {
      console.log('Iniciando búsqueda:', searchQuery);
      if (!searchQuery.trim()) return;
      
      loading = true;
      const baseUrl = 'https://archive.org/advancedsearch.php';
      const params = new URLSearchParams({
          q: `${searchQuery} AND mediatype:(texts) AND format:(EPUB) AND language:(spa)`,
          fl: 'identifier,title,creator,year,downloads',
          sort: ['downloads desc'],
          rows: '50',
          output: 'json'
      });

      fetch(`${baseUrl}?${params.toString()}`)
      .then(response => response.json())
      .then(data => {
          console.log('Resultados obtenidos:', data.response.docs);
          searchResults = data.response.docs;
          loading = false;
      })
      .catch(error => {
          console.error('Error en búsqueda:', error);
          loading = false;
      });
  }

  async function cargarLibro(identifier) {
      console.log('Intentando cargar libro con ID:', identifier);
      try {
          loading = true;
          const downloadUrl = `https://archive.org/download/${identifier}/${identifier}.epub`;
          console.log('URL de descarga construida:', downloadUrl);
          
          const response = await fetch(downloadUrl);
          if (!response.ok) {
              throw new Error(`Error al descargar: ${response.status}`);
          }
          
          const blob = await response.blob();
          file = new Blob([blob], { type: 'application/epub+zip' });
          console.log('Libro cargado correctamente');
          mostrarLector = true;
          
      } catch (error) {
          console.error('Error detallado:', error);
          alert('Error al cargar el libro');
      } finally {
          loading = false;
      }
  }
</script>
<div class="contenedor-busqueda">
  {#if !mostrarLector}
      <h1>Buscar Libros</h1>
      <div class="barra-busqueda">
          <input 
              type="text" 
              bind:value={searchQuery} 
              placeholder="Buscar libros en español..."
              on:keypress={(e) => e.key === 'Enter' && buscarLibros()}
          />
          <button on:click={buscarLibros} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
          </button>
      </div>

      <div class="grid-libros">
          {#each searchResults as libro}
              <div class="tarjeta-libro" on:click={() => cargarLibro(libro.identifier)}>
                  <div class="portada-libro">📚</div>
                  <div class="titulo-libro">{libro.title}</div>
                  {#if libro.creator}
                      <div class="autor-libro">{libro.creator}</div>
                  {/if}
              </div>
          {/each}
      </div>
  {:else}
      <button class="boton-volver" on:click={() => mostrarLector = false}>
          Volver a la búsqueda
      </button>
      <EpubReader {file} />
  {/if}
</div>


<style>
  .contenedor-busqueda {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
  }

  .barra-busqueda {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
  }

  input {
      flex: 1;
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
  }

  .grid-libros {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 2rem;
  }

  .tarjeta-libro {
      border: 1px solid #ddd;
      padding: 1rem;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
      background: white;
  }

  .tarjeta-libro:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .portada-libro {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      font-size: 3rem;
      border-radius: 4px;
  }

  .titulo-libro {
      margin-top: 1rem;
      font-weight: bold;
      text-align: center;
  }

  .autor-libro {
      color: #666;
      font-size: 0.9rem;
      text-align: center;
      margin-top: 0.5rem;
  }

  .descargas, .valoracion {
      font-size: 0.8rem;
      color: #666;
      text-align: center;
      margin-top: 0.5rem;
  }

  .valoracion {
      color: #f0ad4e;
  }

  .boton-volver {
      margin-bottom: 1rem;
      padding: 0.5rem 1rem;
      background: #2c2e2c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
  }

  .boton-volver:hover {
      background: #04720a;
  }
</style>
