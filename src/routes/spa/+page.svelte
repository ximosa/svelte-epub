<script>
    export let data;
    
    let books = data.books;
    let loading = false;
    let error = null;
    let page = 1;
    let hasMore = data.hasMore;
  
    async function loadBooks(loadMore = false) {
        loading = true;
        try {
            const response = await fetch(`/api/spanish-books?page=${page}`);
            const data = await response.json();
            
            if (loadMore) {
                books = [...books, ...data.items];
            } else {
                books = data.items;
            }
            
            hasMore = data.hasMore;
        } catch (err) {
            error = 'Error al cargar los libros';
        } finally {
            loading = false;
        }
    }

    async function loadMoreBooks() {
        page += 1;
        await loadBooks(true);
    }
</script>


<div class="container">
    <h1>Biblioteca en Español</h1>
    
    {#if books.length > 0}
        <div class="books-grid">
            {#each books as book}
                <div class="book-card">
                    {#if book.cover}
                        <img src={book.cover} alt={book.title} class="book-cover"/>
                    {:else}
                        <div class="no-cover">Sin portada disponible</div>
                    {/if}
                    <div class="book-info">
                        <h3>{book.title}</h3>
                        <p class="author">{book.author}</p>
                        <p class="year">Año: {book.year}</p>
                        <div class="button-group">
                            <div class="download-options">
                                {#if book.downloadPdf}
                                    <a href={book.downloadPdf} target="_blank" rel="noopener" class="download-button">
                                        PDF
                                    </a>
                                {/if}
                                {#if book.downloadEpub}
                                    <a href={book.downloadEpub} target="_blank" rel="noopener" class="download-button epub">
                                        EPUB
                                    </a>
                                {/if}
                            </div>
                            <a href={book.readUrl} target="_blank" rel="noopener" class="view-button">
                                Leer en línea
                            </a>
                        </div>
                        
                        
                    </div>
                </div>
            {/each}
        </div>

        {#if hasMore}
            <div class="load-more">
                <button 
                    class="load-more-button" 
                    on:click={loadMoreBooks} 
                    disabled={loading}
                >
                    {loading ? 'Cargando...' : 'Cargar más libros'}
                </button>
            </div>
        {/if}
    {:else if loading}
        <div class="loading">Cargando libros...</div>
    {:else}
        <p>No se encontraron libros en español</p>
    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    .books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        padding: 20px 0;
    }
    .book-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        background: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        transition: transform 0.2s;
    }
    .book-card:hover {
        transform: translateY(-5px);
    }
    .book-cover, .no-cover {
        width: 100%;
        height: 300px;
        object-fit: cover;
    }
    .no-cover {
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
    }
    .book-info {
        padding: 15px;
    }
    .button-group {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    .download-button, .view-button {
        flex: 1;
        padding: 8px 16px;
        border-radius: 4px;
        text-decoration: none;
        text-align: center;
        cursor: pointer;
    }
    .download-button {
        background: #28a745;
        color: white;
        border: none;
    }
    .view-button {
        background: #0066cc;
        color: white;
    }
    .load-more {
        text-align: center;
        padding: 20px 0;
    }
    
    .load-more-button {
        padding: 10px 20px;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.1em;
    }
    
    .load-more-button:disabled {
        background: #cccccc;
        cursor: not-allowed;
    }
    .download-options {
        display: flex;
        gap: 5px;
    }
    .download-button {
        flex: 1;
        padding: 8px;
        background: #28a745;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        text-align: center;
    }
    .download-button.epub {
        background: #17a2b8;
    }
    .loading-container {
        text-align: center;
        padding: 40px;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>
