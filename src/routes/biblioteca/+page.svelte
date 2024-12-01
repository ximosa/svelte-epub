<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import ePub from 'epubjs';

    const CLOUD_STORAGE_PATH = 'https://storage.googleapis.com/storage/v1/b/datosblog-4095b.appspot.com/o';
    let books = [];

    async function loadBooks() {
        try {
            const response = await fetch(`${CLOUD_STORAGE_PATH}?prefix=libros/`);
            const data = await response.json();
            
            if (data.items) {
                for (const item of data.items) {
                    if (item.name.endsWith('.epub')) {
                        const fileUrl = item.mediaLink;
                        const response = await fetch(fileUrl);
                        const blob = await response.blob();
                        const book = ePub(blob);
                        await book.ready;
                        
                        const metadata = await book.loaded.metadata;
                        let coverUrl = null;
                        try {
                            coverUrl = await book.coverUrl();
                        } catch (e) {
                            coverUrl = null;
                        }

                        books = [...books, {
                            title: metadata.title || item.name.split('/').pop(),
                            cover: coverUrl,
                            blob: blob,
                            id: `cloud_${item.name}`
                        }];
                    }
                }
            }
        } catch (error) {
            console.error('Error loading books:', error);
        }
    }

    function openBook(book) {
        const url = URL.createObjectURL(book.blob);
        goto('/reader', { state: { file: book.blob } });
    }

    onMount(() => {
        loadBooks();
    });
</script>
  <div class="library-container">
      <div class="books-grid">
          {#each books as book}
              <div class="book-card" on:click={() => openBook(book)}>
                  {#if book.cover}
                      <img src={book.cover} alt={book.title} class="book-cover"/>
                  {:else}
                      <div class="book-cover default-cover">📚</div>
                  {/if}
                  <div class="book-title">{book.title}</div>
              </div>
          {/each}
      </div>
  </div>

  <style>
      .library-container {
          padding: 2rem;
          height: 100%;
          overflow-y: auto;
      }

      .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 2rem;
      }

      .book-card {
          cursor: pointer;
          padding: 1rem;
          border-radius: 8px;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
      }

      .book-card:hover {
          transform: translateY(-5px);
      }

      .book-cover {
          width: 100%;
          height: 280px;
          object-fit: cover;
          border-radius: 4px;
      }

      .default-cover {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          font-size: 48px;
      }

      .book-title {
          margin-top: 1rem;
          text-align: center;
      }
  </style>
