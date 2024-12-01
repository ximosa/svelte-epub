<script>
  import { onMount } from 'svelte';
  import EpubReader from '$lib/components/EpubReader.svelte';

  let booksGrid;
let file = null;  // Reemplazamos libro por file
let mostrarLector = false;
let ePub;


  const GITHUB_API_URL = 'https://api.github.com/repos/ximosa/epub/contents/epubs';

  onMount(async () => {
    const epubModule = await import('epubjs');
    ePub = epubModule.default;
    await cargarLibrosGithub();
  });

  async function cargarLibrosGithub() {
    try {
      const response = await fetch(GITHUB_API_URL);
      console.log('Respuesta del servidor:', response.status);
      const archivos = await response.json();
      console.log('Archivos obtenidos:', archivos);
    
      booksGrid.innerHTML = '';

      const uploadButton = document.createElement('div');
      uploadButton.className = 'book-card upload-card';
      uploadButton.innerHTML = `
        <div class="book-cover upload-cover">📤</div>
        <div class="book-title">Subir Nuevo Libro</div>
      `;
      uploadButton.onclick = () => mostrarDialogoSubida();
      booksGrid.appendChild(uploadButton);

      for (const archivo of archivos) {
        if (archivo.name.endsWith('.epub')) {
          const response = await fetch(archivo.download_url);
          const blob = await response.blob();
          const card = await crearTarjetaLibro(archivo, blob);
          booksGrid.appendChild(card);
        }
      }
    } catch (error) {
      console.log('Error detallado:', {
        mensaje: error.message,
        tipo: error.name,
        stack: error.stack
      });
    }
  }

  async function crearTarjetaLibro(archivo, blob) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    const book = ePub(blob);
    await book.ready;

    try {
      const coverUrl = await book.coverUrl();
      if (coverUrl) {
        const cover = document.createElement('img');
        cover.className = 'book-cover';
        cover.src = coverUrl;
        card.appendChild(cover);
      } else {
        throw new Error('No cover');
      }
    } catch (e) {
      const defaultCover = document.createElement('div');
      defaultCover.className = 'book-cover default-cover';
      defaultCover.textContent = '📚';
      card.appendChild(defaultCover);
    }
    
    const title = document.createElement('div');
    title.className = 'book-title';
    title.textContent = archivo.name.replace('.epub', '');
    card.appendChild(title);

    card.addEventListener('click', () => cargarLibro(archivo.download_url));
    
    return card;
  }

  async function cargarLibro(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al descargar el libro');
        
        const arrayBuffer = await response.arrayBuffer();
        file = new Blob([arrayBuffer], { type: 'application/epub+zip' });
        mostrarLector = true;
    } catch (error) {
        console.error('Error al cargar el libro:', error);
        alert('Error al cargar el libro');
    }
}



  async function mostrarDialogoSubida() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.epub';
    input.onchange = async (e) => {
      const archivo = e.target.files[0];
      await subirArchivo(archivo);
    };
    input.click();
  }

  async function subirArchivo(archivo) {
    try {
        // Primero obtenemos el SHA del archivo si existe
        const checkResponse = await fetch(`${GITHUB_API_URL}/${encodeURIComponent(archivo.name)}`, {
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`
            }
        });

        let sha = '';
        if (checkResponse.ok) {
            const fileInfo = await checkResponse.json();
            sha = fileInfo.sha;
        }

        const content = await convertirArchivoABase64(archivo);
        
        const data = {
            message: `Añadido nuevo libro: ${archivo.name}`,
            content: content,
            branch: 'main',
            sha: sha  // Incluimos el SHA
        };

        const response = await fetch(
            `${GITHUB_API_URL}/${encodeURIComponent(archivo.name)}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) throw new Error('Error al subir el archivo');
        
        alert('Libro subido correctamente');
        await cargarLibrosGithub();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al subir el libro');
    }
}



  async function convertirArchivoABase64(archivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
</script>

<div class="biblioteca-container">
  {#if !mostrarLector}
    <h1>Biblioteca en la Nube</h1>
    <div bind:this={booksGrid} class="books-grid">
      <!-- Los libros se cargarán aquí dinámicamente -->
    </div>
  {:else}
    <EpubReader {file} on:close={() => mostrarLector = false} />
  {/if}
</div>


<style>
  .biblioteca-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
    padding: 1rem;
  }

  :global(.book-card) {
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: transform 0.2s;
    background: white;
  }

  :global(.book-card:hover) {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  :global(.book-cover) {
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 4px;
  }

  :global(.default-cover) {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    font-size: 3rem;
  }

  :global(.book-title) {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.upload-card) {
    border: 2px dashed #666;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  :global(.upload-cover) {
    font-size: 3rem;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
