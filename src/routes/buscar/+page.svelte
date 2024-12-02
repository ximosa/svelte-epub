<script>
    import { onMount } from 'svelte';
    import EpubReader from '$lib/components/EpubReader.svelte';
    import { currentBook } from '$lib/stores';
    import { goto } from '$app/navigation';

    let searchQuery = '';
    let searchResults = [];
    let loading = false;
    let file = null;
    let mostrarLector = false;
    let ePub;

    onMount(async () => {
        const epubModule = await import('epubjs');
        ePub = epubModule.default;
    });

    async function searchBooks() {
    if (!searchQuery.trim()) {
        alert('Por favor, introduce un término de búsqueda');
        return;
    }

    loading = true;
    searchResults = [];
    
    const searchUrl = 'https://archive.org/advancedsearch.php';
    const params = new URLSearchParams({
        q: `title:(${searchQuery}) AND mediatype:(texts)`,
        fl: ['identifier', 'title', 'creator', 'format'].join(','),
        output: 'json',
        rows: '50'
    });

    try {
        const response = await fetch(`${searchUrl}?${params}`);
        const data = await response.json();
        searchResults = data.response.docs;
    } catch (error) {
        console.error('Error:', error);
        alert('Error en la búsqueda');
    } finally {
        loading = false;
    }
}

async function cargarLibro(identifier) {
    try {
        loading = true;
        const detailsUrl = `https://archive.org/details/${identifier}?output=json`;
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(detailsUrl)}`;
        
        const detailsResponse = await fetch(proxyUrl);
        const details = await detailsResponse.json();
        
        // Construir URL usando el formato estándar de Archive.org
        const epubUrl = `https://archive.org/download/${identifier}/${identifier}_epub.epub`;
        console.log('URL final del EPUB:', epubUrl);
        
        const response = await fetch(`/api/proxy?url=${encodeURIComponent(epubUrl)}`);
        if (!response.ok) throw new Error('Error al descargar el libro');
        
        const arrayBuffer = await response.arrayBuffer();
        const blob = new Blob([arrayBuffer], { type: 'application/epub+zip' });
        
        await goto('/reader', { state: { file: blob } });
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el EPUB. Por favor, intenta con otro libro.');
    } finally {
        loading = false;
    }
}

    function handleKeyPress(event) {
        if (event.key === 'Enter') {
            searchBooks();
        }
    }
</script>
<div class="busqueda-container">
    {#if !mostrarLector}
        <h1>Buscar Libros</h1>
        <div class="search-container">
            <input 
                type="text" 
                bind:value={searchQuery} 
                placeholder="Buscar libros en español..."
                on:keypress={handleKeyPress}
            />
            <button on:click={searchBooks} disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar'}
            </button>
        </div>

        <div class="search-status">
            {#if loading}
                <p>Buscando libros...</p>
            {:else if searchResults.length > 0}
                <p>Se encontraron {searchResults.length} resultados</p>
            {:else if searchQuery}
                <p>No se encontraron resultados</p>
            {/if}
        </div>

        <div class="books-grid">
            {#each searchResults as book}
                <div class="book-card" on:click={() => cargarLibro(book.identifier)}>
                    <div class="book-cover default-cover">📚</div>
                    <div class="book-title">{book.title}</div>
                    {#if book.creator}
                        <div class="book-author">{book.creator}</div>
                    {/if}
                </div>
            {/each}
        </div>
    {:else}
    {#if mostrarLector}
    <button class="back-button" on:click={() => mostrarLector = false}>
        Volver a la búsqueda
    </button>
    <div class="reader-container">
        <EpubReader {file} />
    </div>
{/if}



    {/if}
</div>

<style>
    .busqueda-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .search-container {
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

    button {
        padding: 0.5rem 1rem;
        background: #2c2e2c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .back-button {
        margin-bottom: 1rem;
    }

    button:hover {
        background: #04720a;
    }

    .books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2rem;
        padding: 1rem;
    }

    .book-card {
        position: relative;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: transform 0.2s;
        background: white;
    }

    .book-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .book-cover {
        width: 100%;
        height: 250px;
        object-fit: cover;
        border-radius: 4px;
    }

    .default-cover {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f0f0;
        font-size: 3rem;
    }

    .book-title {
        margin-top: 1rem;
        text-align: center;
        font-size: 0.9rem;
        font-weight: bold;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .book-author {
        text-align: center;
        font-size: 0.8rem;
        color: #666;
        margin-top: 0.5rem;
    }

    .search-status {
        text-align: center;
        margin: 1rem 0;
        color: #666;
    }
    .reader-container {
        width: 100%;
        height: 90vh;
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
    }
</style>
