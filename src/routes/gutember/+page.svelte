<script>
    import { goto } from '$app/navigation';
    import { currentBook } from '$lib/stores';
    import { onMount } from 'svelte';

    let searchQuery = '';
    let searchResults = [];
    let loading = false;
    let iframeLoading = false;
    let popularBooks = [];

    onMount(async () => {
        const searchUrl = 'https://gutendex.com/books';
        const params = new URLSearchParams({
            languages: 'es',
            sort: 'downloads'
        });

        try {
            const response = await fetch(`${searchUrl}?${params}`);
            const data = await response.json();
            popularBooks = data.results;
        } catch (error) {
            console.error('Error cargando libros populares:', error);
        }
    });

    async function searchBooks() {
        if (!searchQuery.trim()) {
            alert('Por favor, introduce un término de búsqueda');
            return;
        }

        loading = true;
        searchResults = [];
        
        const searchUrl = 'https://gutendex.com/books';
        const params = new URLSearchParams({
            search: searchQuery,
            languages: 'es'
        });

        try {
            const response = await fetch(`${searchUrl}?${params}`);
            const data = await response.json();
            searchResults = data.results;
        } catch (error) {
            console.error('Error:', error);
            alert('Error en la búsqueda');
        } finally {
            loading = false;
        }
    }

    async function mostrarContenido(book) {
        iframeLoading = true;
        const epubUrl = book.formats['application/epub+zip'];
        
        if (epubUrl) {
            try {
                const response = await fetch(`/api/proxy?url=${encodeURIComponent(epubUrl)}`);
                if (!response.ok) throw new Error('Error en la descarga');
                
                const blob = await response.blob();
                await goto('/reader', { state: { file: blob } });
            } catch (error) {
                console.error('Error:', error);
                alert('Error al cargar el libro');
            }
        } else {
            alert('Versión EPUB no disponible para este libro');
        }
        iframeLoading = false;
    }
</script>

<div class="gutenberg-container">
    <h1>Biblioteca Project Gutenberg</h1>
    <div class="search-container">
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="Buscar libros en español..."
            on:keypress={(e) => e.key === 'Enter' && searchBooks()}
        />
        <button on:click={searchBooks} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
        </button>
    </div>

    <div class="results-container">
        {#if loading}
            <div class="loading">
                <div class="spinner"></div>
                <p>Buscando libros...</p>
            </div>
        {:else if searchResults.length > 0}
            <h2>Resultados de la búsqueda</h2>
            <div class="books-grid">
                {#each searchResults as book}
                    <div class="book-card" on:click={() => mostrarContenido(book)}>
                        {#if book.formats['image/jpeg']}
                            <img src={book.formats['image/jpeg']} alt={book.title} class="book-cover"/>
                        {:else}
                            <div class="default-cover">📚</div>
                        {/if}
                        <h3>{book.title}</h3>
                        <p class="author">{book.authors[0]?.name || 'Anónimo'}</p>
                        <p class="download-count">Descargas: {book.download_count}</p>
                    </div>
                {/each}
            </div>
        {:else if searchQuery}
            <p class="no-results">No se encontraron resultados</p>
        {:else}
            <h2>Libros Populares en Español</h2>
            <div class="books-grid">
                {#each popularBooks as book}
                    <div class="book-card" on:click={() => mostrarContenido(book)}>
                        {#if book.formats['image/jpeg']}
                            <img src={book.formats['image/jpeg']} alt={book.title} class="book-cover"/>
                        {:else}
                            <div class="default-cover">📚</div>
                        {/if}
                        <h3>{book.title}</h3>
                        <p class="author">{book.authors[0]?.name || 'Anónimo'}</p>
                        <p class="download-count">Descargas: {book.download_count}</p>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .gutenberg-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    h2 {
        margin: 2rem 0 1rem;
        color: #333;
    }

    .search-container {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    input {
        flex: 1;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    button {
        padding: 0.8rem 1.5rem;
        background: #2c2e2c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    button:hover {
        background: #04720a;
    }

    .books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 2rem;
    }

    .book-card {
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

    .book-cover, .default-cover {
        width: 100%;
        height: 280px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .default-cover {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        font-size: 3rem;
    }

    .author {
        color: #666;
        font-size: 0.9rem;
        margin-top: 0.5rem;
    }

    .download-count {
        color: #888;
        font-size: 0.8rem;
        margin-top: 0.5rem;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: #666;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .no-results {
        text-align: center;
        color: #666;
        padding: 2rem;
    }
</style>
