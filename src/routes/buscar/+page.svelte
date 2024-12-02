<script>
    let searchQuery = '';
    let searchResults = [];
    let loading = false;
    let selectedItem = null;
    let iframeLoading = false;

    async function searchBooks() {
        if (!searchQuery.trim()) {
            alert('Por favor, introduce un término de búsqueda');
            return;
        }

        loading = true;
        searchResults = [];
        
        const searchUrl = 'https://archive.org/advancedsearch.php';
        const params = new URLSearchParams({
            q: `title:(${searchQuery}) AND language:(spa OR spanish)`,
            fl: ['identifier', 'title', 'creator', 'mediatype', 'description'].join(','),
            output: 'json',
            rows: '50',
            sort: ['downloads desc']
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

    function mostrarContenido(identifier) {
        iframeLoading = true;
        selectedItem = identifier;
        
        fetch(`https://archive.org/metadata/${identifier}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al conectar con Archive.org');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cargar el contenido. Intente nuevamente.');
                selectedItem = null;
                iframeLoading = false;
            });
    }
</script>

<div class="busqueda-container">
    <h1>Biblioteca Digital</h1>
    <div class="search-container">
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="Buscar contenido en español..."
            on:keypress={(e) => e.key === 'Enter' && searchBooks()}
        />
        <button on:click={searchBooks} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
        </button>
    </div>

    {#if selectedItem}
        <div class="viewer-container">
            <div class="viewer-controls">
                <button class="back-button" on:click={() => selectedItem = null}>
                    Volver a la búsqueda
                </button>
            </div>
            
            {#if iframeLoading}
                <div class="loading-container">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Cargando visualizador...</p>
                        <p class="loading-tip">Este proceso puede tardar unos segundos</p>
                    </div>
                </div>
            {/if}
            
            <iframe
                title="Archive.org Viewer"
                src="https://archive.org/embed/{selectedItem}"
                width="100%"
                height="600px"
                frameborder="0"
                allowfullscreen
                on:load={() => iframeLoading = false}
            ></iframe>
        </div>
    {:else}
        <div class="search-status">
            {#if loading}
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Buscando contenido...</p>
                </div>
            {:else if searchResults.length > 0}
                <p>Se encontraron {searchResults.length} resultados</p>
            {:else if searchQuery}
                <p>No se encontraron resultados</p>
            {/if}
        </div>

        <div class="content-grid">
            {#each searchResults as item}
                <div class="content-card" on:click={() => mostrarContenido(item.identifier)}>
                    <div class="content-icon">
                        {#if item.mediatype === 'texts'}
                            📚
                        {:else if item.mediatype === 'movies'}
                            🎥
                        {:else if item.mediatype === 'audio'}
                            🎵
                        {:else}
                            📄
                        {/if}
                    </div>
                    <div class="content-title">{item.title}</div>
                    {#if item.creator}
                        <div class="content-creator">{item.creator}</div>
                    {/if}
                    <div class="content-type">{item.mediatype}</div>
                </div>
            {/each}
        </div>
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
        transition: background 0.3s ease;
    }

    button:hover {
        background: #04720a;
    }

    .viewer-container {
        position: relative;
    }

    .viewer-controls {
        display: flex;
        padding: 1rem;
        background: #f5f5f5;
    }

    .loading-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }

    .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 10;
    }

    .spinner {
        width: 60px;
        height: 60px;
        border: 6px solid #f3f3f3;
        border-top: 6px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1.5rem;
    }

    .loading-tip {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #666;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .content-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 2rem;
        padding: 1rem;
    }

    .content-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: transform 0.2s;
        background: white;
    }

    .content-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .content-icon {
        font-size: 3rem;
        text-align: center;
        margin-bottom: 1rem;
    }

    .content-title {
        font-weight: bold;
        margin-bottom: 0.5rem;
        text-align: center;
    }

    .content-creator {
        color: #666;
        font-size: 0.9rem;
        text-align: center;
    }

    .content-type {
        margin-top: 0.5rem;
        text-align: center;
        font-size: 0.8rem;
        color: #888;
        text-transform: uppercase;
    }

    .search-status {
        text-align: center;
        margin: 1rem 0;
        color: #666;
        min-height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
